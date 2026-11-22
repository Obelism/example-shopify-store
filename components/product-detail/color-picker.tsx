import { cn } from "cn";
import type { ComponentProps } from "react";

import { Link } from "@/components/ui/link";
import { Swatch } from "@/components/ui/swatch";
import type { OptionGroupState } from "@/lib/product/types";

import styles from "./color-picker.module.css";

interface ColorPickerProps extends ComponentProps<"div"> {
  hideImages?: boolean;
  onSelectValue?: (optionName: string, value: string) => void;
  option: OptionGroupState;
}

export function ColorPicker({
  hideImages,
  onSelectValue,
  option,
  className,
  ...props
}: ColorPickerProps) {
  const selectedValue = option.values.find((value) => value.selected)?.name ?? "";
  return (
    <div className={cn(styles.root, className)} {...props}>
      <p className={styles.label}>
        {option.name}: <span className={styles.selected}>{selectedValue}</span>
      </p>
      <div className={styles.values}>
        {option.values.map((value) => {
          const imageUrl = hideImages
            ? undefined
            : value.swatch?.image || (value.swatch?.color ? undefined : value.image);
          const swatch = (
            <Swatch
              color={value.swatch?.color}
              image={imageUrl}
              label={value.name}
              selected={value.selected}
            />
          );
          if (!value.exists) {
            return (
              <button
                key={value.name}
                aria-label={`${option.name}: ${value.name} (unavailable)`}
                className={styles.value}
                disabled
                type="button"
              >
                {swatch}
              </button>
            );
          }
          return (
            <Link
              key={value.name}
              href={value.href}
              scroll={false}
              className={styles.value}
              data-available={value.available}
              aria-label={`Select ${option.name}: ${value.name}${value.available ? "" : " (sold out)"}`}
              aria-current={value.selected ? "true" : undefined}
              onClick={
                onSelectValue && !value.crossProduct
                  ? (event) => {
                      event.preventDefault();
                      onSelectValue(option.name, value.name);
                    }
                  : undefined
              }
            >
              {swatch}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
