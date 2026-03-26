export const TOKEN_KEY = "auth_token";
export const USER_KEY = "auth_user";

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token || null;
  } catch (err) {
    console.error("Error reading token from localStorage:", err);
    return null;
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveUser(user: any) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error("Error saving user to localStorage:", err);
  }
}

export const getUser = () => {
  try {
    const item = localStorage.getItem(USER_KEY);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error("Failed to parse user from localStorage:", e);
    return null;
  }
};


export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function clearAuth() {
  clearToken();
  clearUser();
}
export type Lang = 'en' | "vi"

export function getLanguage(): Lang {
  const lang = localStorage.getItem("i18nextLng") || "en";
  if (lang.startsWith("vi")) return "vi";
  return "en";
}
