import setupReactSvg from "@obelism/react-svg";

const ICON = { height: 24, width: 24 };

export const {
  config: iconConfig,
  getSvgUrl: getIconUrl,
  Svg,
  SvgProvider,
} = setupReactSvg({
  namespace: "icon",
  rootFolder: "/icons",
  svgMap: {
    check: ICON,
    "chevron-down": ICON,
    "chevron-left": ICON,
    "chevron-right": ICON,
    "chevron-up": ICON,
    "circle-alert": ICON,
    handbag: ICON,
    image: ICON,
    "loader-circle": ICON,
    menu: ICON,
    minus: ICON,
    pause: ICON,
    pencil: ICON,
    play: ICON,
    plus: ICON,
    search: ICON,
    "sliders-horizontal": ICON,
    "trash-2": ICON,
    "triangle-alert": ICON,
    "user-round": ICON,
    "user-round-check": ICON,
    x: ICON,
  },
});

export type IconName = keyof typeof iconConfig.svgMap;
