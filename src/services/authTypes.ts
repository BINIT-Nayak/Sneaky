export type AuthResponse = {
  accessToken: string;
};

export type RefreshResponse = {
  accessToken: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = LoginPayload & {
  name: string;
  isGuest?: boolean;
};
