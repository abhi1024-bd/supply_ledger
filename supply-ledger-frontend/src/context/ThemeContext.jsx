import { createContext, useState, useCallback, useEffect } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "light";
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    // Apply Bootstrap 5 dark mode
    if (theme === "dark") {
      document.documentElement.setAttribute("data-bs-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-bs-theme");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
