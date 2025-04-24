import {ApplicationFailure} from '@temporalio/common';

import {EntryScope} from '../../../../gateway/schema/us/types/entry';
import type {ActivitiesDeps} from '../../../types';
import {prepareGatewayRestError} from '../../utils';
import {ImportWorkbookArgs} from '../types';

export type GetImportCapabilitiesArgs = {
    workflowArgs: ImportWorkbookArgs;
};

type ImportOrder = EntryScope[][];

type GetImportCapabilitiesResult = {
    importOrder: ImportOrder;
    installationAvailableScopes: EntryScope[];
};

const resolveImportOrder = (dependencies: Record<EntryScope, EntryScope[]>): ImportOrder => {
    const result: ImportOrder = [];
    const seen = new Set<EntryScope>();

    const scopes = Object.keys(dependencies) as EntryScope[];

    while (seen.size < scopes.length) {
        const batch: EntryScope[] = [];

        scopes.forEach((scope) => {
            if (!seen.has(scope) && dependencies[scope].every((dep) => seen.has(dep))) {
                batch.push(scope);
            }
        });

        batch.forEach((scope) => {
            seen.add(scope);
        });

        if (batch.length === 0) {
            throw ApplicationFailure.create({
                nonRetryable: true,
                message:
                    'Circular dependency detected in dependencies of workbook transfer capabilities.',
            });
        }

        result.push(batch);
    }

    return result;
};

export const getImportCapabilities = async (
    {gatewayApi, ctx}: ActivitiesDeps,
    {workflowArgs}: GetImportCapabilitiesArgs,
): Promise<GetImportCapabilitiesResult> => {
    const {requestId} = workflowArgs;

    let data;

    try {
        data = await gatewayApi.uiApi.getWorkbooksTransferCapabilities({
            ctx,
            headers: {},
            requestId,
            args: undefined,
        });
    } catch (error: unknown) {
        throw prepareGatewayRestError(error);
    }

    return {
        importOrder: resolveImportOrder(data.responseData.dependencies),
        installationAvailableScopes: Object.keys(data.responseData.dependencies) as EntryScope[],
    };
};
