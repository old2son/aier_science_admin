const THEME_KEY = 'aier_admin_theme';

export type ThemeMode = 'light' | 'dark';

function getPreferredTheme(): ThemeMode {
	if (typeof window === 'undefined') return 'light';

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setDocumentTheme(theme: ThemeMode) {
	document.documentElement.classList.toggle('dark', theme === 'dark');
	document.documentElement.setAttribute('data-theme', theme);
	document.documentElement.style.colorScheme = theme;
}

export function getStoredTheme(): ThemeMode | null {
	if (typeof window === 'undefined') return null;

	const theme = window.localStorage.getItem(THEME_KEY);
	return theme === 'dark' || theme === 'light' ? theme : null;
}

export function getTheme(): ThemeMode {
	return getStoredTheme() ?? getPreferredTheme();
}

export function applyTheme(theme: ThemeMode) {
	if (typeof window === 'undefined') return;

	window.localStorage.setItem(THEME_KEY, theme);
	setDocumentTheme(theme);
}

export function toggleTheme(currentTheme?: ThemeMode) {
	const nextTheme = (currentTheme ?? getTheme()) === 'dark' ? 'light' : 'dark';
	applyTheme(nextTheme);
	return nextTheme;
}

export function initializeTheme() {
	if (typeof window === 'undefined') return;

	setDocumentTheme(getTheme());
}
