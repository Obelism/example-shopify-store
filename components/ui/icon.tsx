import type { ComponentProps } from "react";

import { ICON_SIZE, type IconName, iconConfig, Svg } from "@/lib/icons";

interface IconProps extends Pick<ComponentProps<"svg">, "className" | "style"> {
  name: IconName;
  /** Renders without `SvgProvider`, for trees outside the root layout. */
  standalone?: boolean;
}

function Icon({ name, standalone, ...props }: IconProps) {
  return (
    <Svg
      {...ICON_SIZE}
      {...props}
      aria-hidden="true"
      config={standalone ? iconConfig : undefined}
      svg={name}
      type={standalone ? "inline" : "link"}
    />
  );
}

export { Icon };
