import {NotificationLevel} from '../../../types/models';

export type ExportEntryNotification = {
    code: string;
    message?: string;
    level: NotificationLevel;
    details?: Record<string, unknown>;
};
