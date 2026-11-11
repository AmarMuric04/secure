const readStoredTheme = () => {
	try {
		return localStorage.getItem("secure-theme");
	} catch {
		return null;
	}
};

const storedTheme = readStoredTheme();
const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
const systemTheme = prefersDark ? "dark" : "light";
const isExplicitTheme = storedTheme === "light" || storedTheme === "dark";
const theme = isExplicitTheme ? storedTheme : systemTheme;

document.documentElement.classList.add(theme);
document.documentElement.style.colorScheme = theme;
