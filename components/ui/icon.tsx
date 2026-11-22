import type { ComponentProps } from "react";

import { type IconName, iconConfig, Svg } from "@/lib/icons";

interface IconProps extends Omit<ComponentProps<"svg">, "onLoad" | "ref"> {
  name: IconName;
  /** Renders without `SvgProvider`, for trees outside the root layout. */
  standalone?: boolean;
}

function Icon({ name, standalone, ...props }: IconProps) {
  return (
    <Svg
      aria-hidden="true"
      height="24"
      width="24"
      {...props}
      config={standalone ? iconConfig : undefined}
      svg={name}
      type={standalone ? "inline" : "link"}
    />
  );
}

export { Icon };
