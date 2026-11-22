import setupReactSvg from "@obelism/react-svg";

export const ICON_SIZE = { height: 24, width: 24 };

export const {
  config: iconConfig,
  getSvgUrl: getIconUrl,
  Svg,
  SvgProvider,
} = setupReactSvg({
  namespace: "icon",
  rootFolder: "/icons",
  svgMap: {
    check: ICON_SIZE,
    "chevron-down": ICON_SIZE,
    "chevron-left": ICON_SIZE,
    "chevron-right": ICON_SIZE,
    "chevron-up": ICON_SIZE,
    "circle-alert": ICON_SIZE,
    handbag: ICON_SIZE,
    image: ICON_SIZE,
    "loader-circle": ICON_SIZE,
    menu: ICON_SIZE,
    minus: ICON_SIZE,
    pause: ICON_SIZE,
    pencil: ICON_SIZE,
    play: ICON_SIZE,
    plus: ICON_SIZE,
    search: ICON_SIZE,
    "sliders-horizontal": ICON_SIZE,
    "trash-2": ICON_SIZE,
    "triangle-alert": ICON_SIZE,
    "user-round": ICON_SIZE,
    "user-round-check": ICON_SIZE,
    x: ICON_SIZE,
  },
});

export type IconName = keyof typeof iconConfig.svgMap;
