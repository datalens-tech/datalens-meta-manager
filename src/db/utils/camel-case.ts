const camelCase = (str: string) => {
    const wordPattern = new RegExp(
        ['[A-Z][a-z]+', '[A-Z]+(?=[A-Z][a-z])', '[A-Z]+', '[a-z]+', '[0-9]+'].join('|'),
        'g',
    );
    const words = str.match(wordPattern) || [];
    return words
        .map((word, index) => (index === 0 ? word : word[0].toUpperCase() + word.slice(1)))
        .join('');
};

export const convertCamelCase = (dataObj = {}) => {
    return Object.entries(dataObj).reduce((dataObjFormed: {[key: string]: unknown}, objEntry) => {
        const [property, value] = objEntry;

        const propertyCamelCase = camelCase(property);
        dataObjFormed[propertyCamelCase] = value;

        return dataObjFormed;
    }, {});
};
