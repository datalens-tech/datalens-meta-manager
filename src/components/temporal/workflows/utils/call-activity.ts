import {ActivitiesDeps} from '../../types';

export const callActivity = <T, A extends {workflowArgs: {requestId: string}}>({
    deps,
    args,
    activityFn,
}: {
    deps: ActivitiesDeps;
    args: A;
    activityFn: (deps: ActivitiesDeps, args: A) => Promise<T>;
}): Promise<T> => {
    return deps.ctx.call(
        `Activity ${activityFn.name}`,
        (ctx) => {
            return activityFn(
                {
                    ...deps,
                    ctx,
                },
                args,
            );
        },
        {
            loggerPostfix: `[${args.workflowArgs.requestId}]`,
        },
    );
};
