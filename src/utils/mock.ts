const MOCK_QUERY_KEY = 'mock';
const MOCK_STORAGE_KEY = 'enable-mock';

function parseBooleanFlag(value: string | null | undefined) {
	if (!value) return undefined;

	const normalized = value.trim().toLowerCase();

	if (['1', 'true', 'on', 'yes'].includes(normalized)) {
		return true;
	}

	if (['0', 'false', 'off', 'no'].includes(normalized)) {
		return false;
	}

	return undefined;
}

export function isMockEnabled() {
	const envEnabled = parseBooleanFlag(import.meta.env.VITE_ENABLE_MOCK);

	if (typeof window === 'undefined') {
		return import.meta.env.DEV || envEnabled === true;
	}

	const searchParams = new URLSearchParams(window.location.search);
	const queryEnabled = parseBooleanFlag(searchParams.get(MOCK_QUERY_KEY));

	if (typeof queryEnabled === 'boolean') {
		window.localStorage.setItem(MOCK_STORAGE_KEY, String(queryEnabled));
		return queryEnabled;
	}

	if (typeof envEnabled === 'boolean') {
		return envEnabled;
	}

	const storageEnabled = parseBooleanFlag(window.localStorage.getItem(MOCK_STORAGE_KEY));

	if (typeof storageEnabled === 'boolean') {
		return storageEnabled;
	}

	return import.meta.env.DEV || envEnabled === true;
}

export function getMockServiceWorkerUrl() {
	return `${import.meta.env.BASE_URL}mockServiceWorker.js`;
}

export function getRequestBaseUrl() {
	if (isMockEnabled()) {
		return '/api';
	}

	return import.meta.env.VITE_API_BASE_URL;
}
