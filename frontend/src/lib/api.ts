import axios from 'axios';

const isServer = typeof window === 'undefined';
const isDev = process.env.NODE_ENV === 'development';

const getBaseURL = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || '';
    if (url) {
        return url.endsWith('/api') ? url : `${url}/api`;
    }
    return '/api'; // Fallback if no URL set
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
});

if (typeof window !== 'undefined') {
    console.log('API Client Initialized with baseURL:', api.defaults.baseURL);
}

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
