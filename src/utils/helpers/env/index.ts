import {isTruthyString} from '../string';

export const isTruthyEnvVariable = (variableName: string): boolean => {
    const variable = process.env[variableName];

    return variable ? isTruthyString(variable) : false;
};

export const getEnvCert = (variableName: string): string | undefined => {
    const variable = process.env[variableName];

    if (!variable) {
        return undefined;
    }

    return variable.replace(/\\n/g, '\n');
};

export const getRequiredEnvVariable = (variableName: string): string | undefined => {
    const variable = process.env[variableName];

    if (!variable) {
        throw new Error(`Missing ${variableName} in env!`);
    }

    return variable;
};
