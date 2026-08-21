import 'axios';

declare module 'axios' {
        interface AxiosRequestConfig {
                cancelOnRouteChange?: boolean;
                allowWhenAuthInvalidated?: boolean;
        }

        interface InternalAxiosRequestConfig {
                cancelOnRouteChange?: boolean;
                allowWhenAuthInvalidated?: boolean;
        }
}
