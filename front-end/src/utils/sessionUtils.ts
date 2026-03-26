export const getSessionItem = (key: string, defaultValue: string) => {
    const value = sessionStorage.getItem(key);
    return value !== null ? value : defaultValue;
};

export const setSessionItem = (key: string, value: string) => {
    sessionStorage.setItem(key, value);
};

export const getSessionSortOrder = (key: string, defaultValue: "asc" | "desc") => {
    const value = sessionStorage.getItem(key);
    return value === "asc" || value === "desc" ? value : defaultValue;
};