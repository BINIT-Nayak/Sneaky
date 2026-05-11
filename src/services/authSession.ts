export const USER_STORAGE_KEY = "sneaky_user";

export const AUTH_UNAUTHORIZED_EVENT = "sneaky:unauthorized";

const LEGACY_ACCESS_TOKEN_STORAGE_KEY = "sneaky_access_token";
const LEGACY_REFRESH_TOKEN_STORAGE_KEY = "sneaky_refresh_token";

let accessToken: string | null = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (nextAccessToken: string | null) => {
  accessToken = nextAccessToken;
};

export const clearStoredAuthSession = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_STORAGE_KEY);
  setAccessToken(null);
};

export const notifyUnauthorizedSession = () => {
  clearStoredAuthSession();
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
};
