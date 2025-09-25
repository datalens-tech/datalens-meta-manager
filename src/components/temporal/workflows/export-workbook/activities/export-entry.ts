import {ApplicationFailure} from '@temporalio/common';
import {raw} from 'objection';

import {ExportEntryModel} from '../../../../../db/models';
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
    const {workbookId, exportId, requestId, tenantId} = workflowArgs;

    let data;

    const {getAuthArgsUiApiPrivate} = registry.common.functions.get();

    try {
        data = await gatewayApi.uiApi.exportWorkbookEntry({
            ctx,
            headers: {
                ...makeTenantIdHeader(tenantId),
            },
            requestId,
            args: {exportId: entryId, scope, idMapping, workbookId},
            authArgs: await getAuthArgsUiApiPrivate({ctx}),
        });
    } catch (error: unknown) {
        throw prepareGatewayRestError(error);
    }

    const {
        responseData: {entryData, notifications},
    } = data;

    const mockEntryId = idMapping[entryId];

    await ExportEntryModel.query(ExportEntryModel.primary).insert({
        exportId,
        entryId,
        mockEntryId,
        scope,
        data: entryData,
        notifications:
            notifications.length > 0 ? raw('?::jsonb', [JSON.stringify(notifications)]) : undefined,
    });

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
