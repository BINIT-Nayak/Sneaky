import type { FC, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  color?: string;
  size?: number | string;
};

const strokeDefaults = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 2,
} as const;

const IconBase: FC<
  IconProps & {
    fillIcon?: boolean;
  }
> = ({ children, color, fillIcon = false, size = "1em", style, ...props }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size}
    style={{ color, ...style }}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
    {...(fillIcon
      ? { fill: "currentColor", stroke: "none" }
      : strokeDefaults)}
    {...props}
  >
    {children}
  </svg>
);

export const FiHeart: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
  </IconBase>
);

export const PiHeartStraightFill: FC<IconProps> = (props) => (
  <IconBase fillIcon {...props}>
    <path d="M12 21.4 3.9 13.8A6 6 0 0 1 12 5a6 6 0 0 1 8.1 8.8L12 21.4Z" />
  </IconBase>
);

export const GiRoundStar: FC<IconProps> = (props) => (
  <IconBase fillIcon {...props}>
    <circle cx="12" cy="12" r="10" opacity="0.18" />
    <path d="m12 5.2 1.9 4 4.4.6-3.2 3.1.8 4.4-3.9-2.1-3.9 2.1.8-4.4-3.2-3.1 4.4-.6 1.9-4Z" />
  </IconBase>
);

export const RiShoppingCartFill: FC<IconProps> = (props) => (
  <IconBase fillIcon {...props}>
    <path d="M7.2 18.4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Zm9.6 0a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM3 3a1 1 0 0 0 0 2h1.2l2.2 9.5A3 3 0 0 0 9.3 17h7.4a3 3 0 0 0 2.9-2.3l1.2-5A2.2 2.2 0 0 0 18.7 7H7.2L6.5 4A1.3 1.3 0 0 0 5.2 3H3Z" />
  </IconBase>
);

export const FiShoppingCart: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L22 6H6" />
  </IconBase>
);

export const FiShoppingBag: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
  </IconBase>
);

export const TiHome: FC<IconProps> = (props) => (
  <IconBase fillIcon {...props}>
    <path d="M3 10.8 12 3l9 7.8v9.4a1.8 1.8 0 0 1-1.8 1.8h-4.7v-6.2h-5V22H4.8A1.8 1.8 0 0 1 3 20.2v-9.4Z" />
  </IconBase>
);

export const CgProfile: FC<IconProps> = (props) => <FiUser {...props} />;

export const FiUser: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </IconBase>
);

export const RiAdminFill: FC<IconProps> = (props) => (
  <IconBase fillIcon {...props}>
    <path d="M12 2 20 5.5v6.1c0 5-3.4 8.7-8 10.4-4.6-1.7-8-5.4-8-10.4V5.5L12 2Zm0 4.5a3 3 0 0 0-1.5 5.6v4.4h3v-4.4A3 3 0 0 0 12 6.5Z" />
  </IconBase>
);

export const RiNotification3Fill: FC<IconProps> = (props) => (
  <IconBase fillIcon {...props}>
    <path d="M12 22a2.6 2.6 0 0 0 2.5-2h-5A2.6 2.6 0 0 0 12 22ZM5 17h14l-1.8-2.4V10a5.2 5.2 0 0 0-4.1-5.1V3a1.1 1.1 0 0 0-2.2 0v1.9A5.2 5.2 0 0 0 6.8 10v4.6L5 17Z" />
  </IconBase>
);

export const RiNotification3Line: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </IconBase>
);

export const RiDeleteBin6Line: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15" />
    <path d="M10 11v6M14 11v6" />
  </IconBase>
);

export const FiTrash2 = RiDeleteBin6Line;

export const TiThMenu: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </IconBase>
);

export const ImCross: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </IconBase>
);

export const FaTimes = ImCross;
export const FiX = ImCross;

export const FaSignInAlt: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="m10 17 5-5-5-5M15 12H3" />
  </IconBase>
);

export const FiEye: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </IconBase>
);

export const FiEyeOff: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
    <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10.5 7 10.5 7a18.2 18.2 0 0 1-3.1 3.9M6.5 6.9A18.1 18.1 0 0 0 1.5 12s4 7 10.5 7c1.3 0 2.5-.3 3.5-.8" />
  </IconBase>
);

export const FiClock: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </IconBase>
);

export const FiEdit2: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </IconBase>
);

export const FiLogOut: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </IconBase>
);

export const FiMail: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
    <path d="m22 6-10 7L2 6" />
  </IconBase>
);

export const FiSave: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M17 21v-8H7v8M7 3v5h8" />
  </IconBase>
);

export const FiShield: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
  </IconBase>
);

export const FiExternalLink: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6M10 14 21 3" />
  </IconBase>
);

export const FiMinus: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M5 12h14" />
  </IconBase>
);

export const FiPlus: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M12 5v14M5 12h14" />
  </IconBase>
);

export const FiCheck: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="m20 6-11 11-5-5" />
  </IconBase>
);

export const FiPackage: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="m21 16-9 5-9-5V8l9-5 9 5Z" />
    <path d="m3.3 7.5 8.7 5 8.7-5M12 22V12" />
  </IconBase>
);

export const FiRefreshCw: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" />
    <path d="M3 21v-5h5M3 12A9 9 0 0 1 18.4 5.6L21 8" />
    <path d="M21 3v5h-5" />
  </IconBase>
);

export const FiSlash: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M4.9 4.9 19.1 19.1" />
  </IconBase>
);

export const FiUsers: FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
  </IconBase>
);
