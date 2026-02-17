import axios from 'axios';

const isServer = typeof window === 'undefined';
const isDev = process.env.NODE_ENV === 'development';

const api = axios.create({
    baseURL: isServer || isDev
        ? ((process.env.NEXT_PUBLIC_API_URL || '').endsWith('/api')
            ? process.env.NEXT_PUBLIC_API_URL
            : `${process.env.NEXT_PUBLIC_API_URL}/api`)
        : '/api', // In Production Browser, hit the Next.js proxy at /api for cookies
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect if we are in the browser AND not on the login page already
            // AND not on a quiz participation page (to allow link-based access)
            if (
                typeof window !== 'undefined' &&
                window.location.pathname !== '/' &&
                !window.location.pathname.startsWith('/quiz/')
            ) {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
