import {
  AUTH_UNAUTHORIZED_EVENT,
  USER_STORAGE_KEY,
  clearStoredAuthSession,
  getAccessToken,
  notifyUnauthorizedSession,
  setAccessToken,
} from "./authSession";

const LEGACY_ACCESS_TOKEN_STORAGE_KEY = "sneaky_access_token";
const LEGACY_REFRESH_TOKEN_STORAGE_KEY = "sneaky_refresh_token";

describe("authSession", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clears stored auth data", () => {
    localStorage.setItem(USER_STORAGE_KEY, "user");
    localStorage.setItem(LEGACY_ACCESS_TOKEN_STORAGE_KEY, "access");
    localStorage.setItem(LEGACY_REFRESH_TOKEN_STORAGE_KEY, "refresh");
    setAccessToken("access");

    clearStoredAuthSession();

    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_ACCESS_TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_REFRESH_TOKEN_STORAGE_KEY)).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it("notifies listeners when the session becomes unauthorized", () => {
    const listener = jest.fn();
    localStorage.setItem(USER_STORAGE_KEY, "user");
    localStorage.setItem(LEGACY_ACCESS_TOKEN_STORAGE_KEY, "access");
    localStorage.setItem(LEGACY_REFRESH_TOKEN_STORAGE_KEY, "refresh");
    setAccessToken("access");
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, listener);

    notifyUnauthorizedSession();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_ACCESS_TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_REFRESH_TOKEN_STORAGE_KEY)).toBeNull();
    expect(getAccessToken()).toBeNull();

    window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, listener);
  });
});
