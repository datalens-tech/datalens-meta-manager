import _ from 'lodash';
import {raw} from 'objection';

import {META_MANAGER_NOTIFICATION_CODE} from '../../../../../constants';
import {ImportModel, ImportModelColumn} from '../../../../../db/models';
import {ImportEntryNotifications, ImportNotification} from '../../../../../db/models/import/types';
import {registry} from '../../../../../registry';
import {NotificationLevel} from '../../../../gateway/schema/ui-api/types';
import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import type {ActivitiesDeps} from '../../../types';
import {ImportWorkbookArgs} from '../types';

export type CheckScopesAvailabilityArgs = {
    workflowArgs: ImportWorkbookArgs;
    exportedScopes: EntryScope[];
    installationAvailableScopes: EntryScope[];
};

export const checkScopesAvailability = async (
    __: ActivitiesDeps,
    {workflowArgs, exportedScopes, installationAvailableScopes}: CheckScopesAvailabilityArgs,
): Promise<void> => {
    const notAvailableScopes = _.difference(exportedScopes, installationAvailableScopes);

    if (!notAvailableScopes.length) {
        return;
    }

    const {importId} = workflowArgs;

    const notifications: ImportNotification[] = notAvailableScopes.map((scope) => ({
        code: META_MANAGER_NOTIFICATION_CODE.SCOPE_NOT_AVAILABLE_FOR_INSTALLATION,
        level: NotificationLevel.Warning,
        message: `Entries with scope "${scope}" is not available in current installation and will not be imported.`,
    }));

    const {db} = registry.getDbInstance();

    await ImportModel.query(db.primary)
        .patch({
            notifications: raw("jsonb_insert(COALESCE(??, '[]'), '{-1}', ?, true)", [
                ImportModelColumn.Notifications,
                {
                    notifications,
                } satisfies ImportEntryNotifications,
            ]),
        })
        .where({
            importId,
        });
};
