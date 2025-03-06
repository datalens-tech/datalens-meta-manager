export enum Feature {
    ReadOnlyMode = 'ReadOnlyMode',
}

export type FeaturesConfig = {
    [key in Feature]?: boolean;
};
