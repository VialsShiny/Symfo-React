import throwError from './ThrowError';
export const fetchData = async (url, options = {}) => {
    try {
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            ...options,
        });

        if (!res.ok) {
            return res.json();
        }

        return await res.json();
    } catch (error) {
        throwError(error, 'Fetch error');
        return [
            {
                succes: false,
                error: {message: error},
            },
        ];
    }
};
