const TRUTHY_STRINGS = ['1', 'true'];

export const isTruthyString = (value: string) => {
    return TRUTHY_STRINGS.includes(value);
};
