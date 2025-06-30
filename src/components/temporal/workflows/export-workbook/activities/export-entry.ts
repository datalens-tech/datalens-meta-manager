import {ApplicationFailure} from '@temporalio/common';
import {PartialModelObject, raw} from 'objection';

import {ExportEntryModel, ExportModel, ExportModelColumn} from '../../../../../db/models';
import {EXPORT_DATA_ENTRIES_FIELD} from '../../../../../db/models/export/constants';
import {ExportEntriesData, ExportEntryNotifications} from '../../../../../db/models/export/types';
import {registry} from '../../../../../registry';
import {makeTenantIdHeader} from '../../../../../utils';
import {NotificationLevel} from '../../../../gateway/schema/ui-api/types';
import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import type {ActivitiesDeps} from '../../../types';
import {prepareGatewayRestError} from '../../utils';
import {APPLICATION_FAILURE_TYPE} from '../constants';
import {ExportWorkbookArgs} from '../types';

export type ExportEntryArgs = {
    workflowArgs: ExportWorkbookArgs;
    entryId: string;
    scope: EntryScope;
    idMapping: Record<string, string>;
};

export const exportEntry = async (
    {ctx, gatewayApi}: ActivitiesDeps,
    {workflowArgs, entryId, scope, idMapping}: ExportEntryArgs,
): Promise<void> => {
    const {workbookId, exportId, requestId, tenantId, withExportEntries} = workflowArgs;

    let data;

    try {
        data = await gatewayApi.uiApi.exportWorkbookEntry({
            ctx,
            headers: {
                ...makeTenantIdHeader(tenantId),
            },
            requestId,
            args: {exportId: entryId, scope, idMapping, workbookId},
        });
    } catch (error: unknown) {
        throw prepareGatewayRestError(error);
    }

    const {
        responseData: {entryData, notifications},
    } = data;

    const mockEntryId = idMapping[entryId];

    const update: PartialModelObject<ExportModel> = {
        data: raw("jsonb_set(??, '{??,??}', (COALESCE(??->?->?, '{}') || ?))", [
            ExportModelColumn.Data,
            EXPORT_DATA_ENTRIES_FIELD,
            scope,
            ExportModelColumn.Data,
            EXPORT_DATA_ENTRIES_FIELD,
            scope,
            {
                [mockEntryId]: entryData,
            } satisfies ExportEntriesData,
        ]),
    };

    if (notifications.length > 0) {
        update.notifications = raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
            ExportModelColumn.Notifications,
            {
                entryId,
                scope,
                notifications,
            } satisfies ExportEntryNotifications,
        ]);
    }

    const {db} = registry.getDbInstance();

    if (withExportEntries) {
        await ExportEntryModel.query(db.primary).insert({
            exportId,
            entryId,
            mockEntryId,
            scope,
            data: entryData,
            notifications: raw('?::jsonb', [JSON.stringify(notifications)]),
        });
    } else {
        await ExportModel.query(db.primary).patch(update).where({
            exportId,
        });
    }

    const criticalNotifications = notifications.filter(
        ({level}) => level === NotificationLevel.Critical,
    );

    if (criticalNotifications.length > 0) {
        throw ApplicationFailure.create({
            nonRetryable: true,
            message: `Got critical notification while exporting entry: ${entryId}`,
            type: APPLICATION_FAILURE_TYPE.GOT_CRITICAL_NOTIFICATION,
        });
    }
};
