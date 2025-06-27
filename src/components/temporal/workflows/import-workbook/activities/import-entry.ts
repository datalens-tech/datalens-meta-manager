import {ApplicationFailure} from '@temporalio/common';
import {raw} from 'objection';

import {ImportModel, ImportModelColumn} from '../../../../../db/models';
import {EXPORT_DATA_ENTRIES_FIELD} from '../../../../../db/models/export/constants';
import {ImportEntryNotifications} from '../../../../../db/models/import/types';
import {registry} from '../../../../../registry';
import {makeTenantIdHeader} from '../../../../../utils';
import {NotificationLevel} from '../../../../gateway/schema/ui-api/types';
import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import type {ActivitiesDeps} from '../../../types';
import {prepareGatewayRestError} from '../../utils';
import {APPLICATION_FAILURE_TYPE} from '../constants';
import {ImportWorkbookArgs} from '../types';

export type ImportEntryArgs = {
    workflowArgs: ImportWorkbookArgs;
    scope: EntryScope;
    mockEntryId: string;
    idMapping: Record<string, string>;
};

type ImportEntryResult = {
    entryId: string;
};

export const importEntry = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {workflowArgs, mockEntryId, idMapping, scope}: ImportEntryArgs,
): Promise<ImportEntryResult> => {
    const {importId, workbookId, requestId, tenantId} = workflowArgs;

    const {db} = registry.getDbInstance();

    const result = (await ImportModel.query(db.replica)
        .select(
            raw('??->?->?->? as data', [
                ImportModelColumn.Data,
                EXPORT_DATA_ENTRIES_FIELD,
                scope,
                mockEntryId,
            ]),
        )
        .first()
        .where({
            importId,
        })) as unknown as {
        data: Record<string, unknown> | null;
    };

    if (!result.data) {
        throw ApplicationFailure.create({
            nonRetryable: true,
            message: `No data for id: ${mockEntryId}.`,
        });
    }

    let data;

    try {
        data = await gatewayApi.uiApi.importWorkbookEntry({
            ctx,
            headers: {
                ...makeTenantIdHeader(tenantId),
            },
            requestId,
            args: {
                idMapping,
                entryData: result.data,
                workbookId,
            },
        });
    } catch (error: unknown) {
        throw prepareGatewayRestError(error);
    }

    const {
        responseData: {id: entryId, notifications},
    } = data;

    if (notifications.length > 0) {
        await ImportModel.query(db.primary)
            .patch({
                notifications: raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
                    ImportModelColumn.Notifications,
                    {
                        entryId,
                        scope,
                        notifications,
                    } satisfies ImportEntryNotifications,
                ]),
            })
            .where({
                importId,
            });

        const criticalNotifications = notifications.filter(
            ({level}) => level === NotificationLevel.Critical,
        );

        if (criticalNotifications.length > 0) {
            throw ApplicationFailure.create({
                nonRetryable: true,
                message: `Got critical notification while importing entry: ${mockEntryId}`,
                type: APPLICATION_FAILURE_TYPE.GOT_CRITICAL_NOTIFICATION,
            });
        }
    }

    return {entryId};
};
