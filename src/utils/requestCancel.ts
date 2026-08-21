import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

type ManagedRequestConfig = InternalAxiosRequestConfig & {
	__requestId__?: string;
};

interface PendingRequestEntry {
	controller: AbortController;
	cleanup: () => void;
	cancelOnRouteChange: boolean;
}

const pendingRequests = new Map<string, PendingRequestEntry>();

let requestSeed = 0;

function createRequestId(config: InternalAxiosRequestConfig) {
	requestSeed += 1;
	return [config.method ?? 'get', config.url ?? '', Date.now(), requestSeed].join(':');
}

function createMergedSignal(signals: AbortSignal[]) {
	const validSignals = signals.filter(Boolean);

	if (!validSignals.length) {
		return {
			signal: undefined,
			cleanup: () => {}
		};
	}

	if (validSignals.length === 1) {
		return {
			signal: validSignals[0],
			cleanup: () => {}
		};
	}

	if (typeof AbortSignal.any === 'function') {
		return {
			signal: AbortSignal.any(validSignals),
			cleanup: () => {}
		};
	}

	const controller = new AbortController();
	const abort = () => {
		controller.abort();
	};

	for (const signal of validSignals) {
		if (signal.aborted) {
			controller.abort();
			break;
		}

		signal.addEventListener('abort', abort, { once: true });
	}

	return {
		signal: controller.signal,
		cleanup: () => {
			for (const signal of validSignals) {
				signal.removeEventListener('abort', abort);
			}
		}
	};
}

export function registerCancelableRequest(config: InternalAxiosRequestConfig) {
	const managedConfig = config as ManagedRequestConfig;
	const requestId = createRequestId(config);
	const controller = new AbortController();
	const { signal, cleanup } = createMergedSignal([config.signal, controller.signal].filter(Boolean) as AbortSignal[]);

	managedConfig.__requestId__ = requestId;
	managedConfig.signal = signal;

	pendingRequests.set(requestId, {
		controller,
		cleanup,
		cancelOnRouteChange: managedConfig.cancelOnRouteChange !== false
	});

	return managedConfig;
}

export function cleanupCancelableRequest(config?: InternalAxiosRequestConfig) {
	const managedConfig = config as ManagedRequestConfig | undefined;
	const requestId = managedConfig?.__requestId__;

	if (!requestId) {
		return;
	}

	const pendingRequest = pendingRequests.get(requestId);

	pendingRequest?.cleanup();
	pendingRequests.delete(requestId);
}

export function cancelRouteChangePendingRequests(reason = '页面已切换，请求已取消') {
	for (const [requestId, pendingRequest] of pendingRequests.entries()) {
		if (!pendingRequest.cancelOnRouteChange) {
			continue;
		}

		pendingRequest.controller.abort(reason);
		pendingRequest.cleanup();
		pendingRequests.delete(requestId);
	}
}

export function cancelAllPendingRequests(reason = '登录已失效，请求已取消') {
	for (const [requestId, pendingRequest] of pendingRequests.entries()) {
		pendingRequest.controller.abort(reason);
		pendingRequest.cleanup();
		pendingRequests.delete(requestId);
	}
}

export function isRequestCanceledError(error: unknown) {
	if (axios.isCancel(error)) {
		return true;
	}

	const axiosError = error as AxiosError | undefined;
	return axiosError?.code === 'ERR_CANCELED' || axiosError?.name === 'CanceledError';
}
