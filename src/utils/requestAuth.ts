const AUTH_INVALIDATED_REQUEST_ERROR_CODE = 'AUTH_INVALIDATED_REQUEST_BLOCKED';
const AUTH_INVALIDATED_REQUEST_ERROR_NAME = 'AuthInvalidatedRequestError';

let authInvalidated = false;

export interface AuthInvalidatedRequestError extends Error {
	code: typeof AUTH_INVALIDATED_REQUEST_ERROR_CODE;
}

export function markAuthInvalidated() {
	authInvalidated = true;
}

export function resetAuthInvalidated() {
	authInvalidated = false;
}

export function isAuthInvalidated() {
	return authInvalidated;
}

export function createAuthInvalidatedRequestError(): AuthInvalidatedRequestError {
	const error = new Error('登录已失效，已阻止后续请求') as AuthInvalidatedRequestError;

	error.name = AUTH_INVALIDATED_REQUEST_ERROR_NAME;
	error.code = AUTH_INVALIDATED_REQUEST_ERROR_CODE;

	return error;
}

export function isAuthInvalidatedRequestError(error: unknown) {
	const candidate = error as Partial<AuthInvalidatedRequestError> | undefined;

	return (
		candidate?.code === AUTH_INVALIDATED_REQUEST_ERROR_CODE ||
		candidate?.name === AUTH_INVALIDATED_REQUEST_ERROR_NAME
	);
}
