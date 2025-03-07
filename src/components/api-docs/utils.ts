export const formatPath = (rawPath: string) => {
    return `/${rawPath
        .split('/')
        .reduce<string[]>((acc, item) => {
            if (item) {
                if (item.startsWith(':')) {
                    const [param, ...postfixes] = item.slice(1).split('[:]');
                    acc.push(`{${param}}${postfixes.length > 0 ? `:${postfixes.join(':')}` : ''}`);
                } else {
                    acc.push(item);
                }
            }
            return acc;
        }, [])
        .join('/')}`;
};
