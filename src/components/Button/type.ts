export const ButtonVariant = {
  DEFAULT: "default",
  NEUMORPHIC: "neumorphic",
} as const;

export type ButtonVariant = (typeof ButtonVariant)[keyof typeof ButtonVariant];
