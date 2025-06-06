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

export const getEnvVariable = (variableName: string): string | undefined => {
    return process.env[variableName];
};
