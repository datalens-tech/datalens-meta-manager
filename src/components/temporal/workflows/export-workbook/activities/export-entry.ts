import {ApplicationFailure} from '@temporalio/common';
import {PartialModelObject, raw, transaction} from 'objection';

import {ExportEntryModel, ExportModelColumn, WorkbookExportModel} from '../../../../../db/models';
import {WORKBOOK_EXPORT_DATA_ENTRIES_FIELD} from '../../../../../db/models/workbook-export/constants';
import {
    WorkbookExportEntriesData,
    WorkbookExportEntryNotifications,
} from '../../../../../db/models/workbook-export/types';
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

    const update: PartialModelObject<WorkbookExportModel> = {};

    if (!withExportEntries) {
        update.data = raw("jsonb_set(??, '{??,??}', (COALESCE(??->?->?, '{}') || ?))", [
            ExportModelColumn.Data,
            WORKBOOK_EXPORT_DATA_ENTRIES_FIELD,
            scope,
            ExportModelColumn.Data,
            WORKBOOK_EXPORT_DATA_ENTRIES_FIELD,
            scope,
            {
                [mockEntryId]: entryData,
            } satisfies WorkbookExportEntriesData,
        ]);
    }

    if (notifications.length > 0) {
        update.notifications = raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
            ExportModelColumn.Notifications,
            {
                entryId,
                scope,
                notifications,
            } satisfies WorkbookExportEntryNotifications,
        ]);
    }

    const {db} = registry.getDbInstance();

    await transaction(db.primary, async (trx) => {
        await Promise.all([
            WorkbookExportModel.query(trx).patch(update).where({
                exportId,
            }),
            ExportEntryModel.query(trx).insert({
                exportId,
                mockEntryId,
                scope,
                data: entryData,
            }),
        ]);
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
