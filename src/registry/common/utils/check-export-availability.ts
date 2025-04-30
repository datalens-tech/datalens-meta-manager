import {AppContext} from '@gravity-ui/nodekit';

export type CheckExportAvailability = (args: {ctx: AppContext}) => Promise<void>;

export const checkExportAvailability: CheckExportAvailability = () => Promise.resolve();
