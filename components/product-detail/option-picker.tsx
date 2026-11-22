import { cn } from "cn";
import type { ComponentProps } from "react";

import { Link } from "@/components/ui/link";
import type { OptionGroupState } from "@/lib/product/types";

import styles from "./option-picker.module.css";

interface OptionPickerProps extends ComponentProps<"div"> {
  compact?: boolean;
  onSelectValue?: (optionName: string, value: string) => void;
  option: OptionGroupState;
}

export function OptionPicker({
  compact = false,
  onSelectValue,
  option,
  className,
  ...props
}: OptionPickerProps) {
  return (
    <div className={cn(styles.root, className)} {...props}>
      <p className={styles.label}>{option.name}</p>
      <div className={styles.values}>
        {option.values.map((value) => {
          const classes = cn(styles.value, compact && styles.compact);

          // Invisible medium-weight twin reserves the bold width so pills don't shift on selection.
          const label = (
            <>
              <span className={styles.name}>{value.name}</span>
              <span aria-hidden="true" className={styles.twin}>
                {value.name}
              </span>
            </>
          );

          if (!value.exists) {
            return (
              <button
                key={value.name}
                aria-label={`${option.name}: ${value.name} (unavailable)`}
                className={classes}
                disabled
                type="button"
              >
                {label}
              </button>
            );
          }

          return (
            <Link
              key={value.name}
              href={value.href}
              scroll={false}
              className={classes}
              aria-current={value.selected ? "true" : undefined}
              data-available={value.available}
              aria-label={value.available ? undefined : `${option.name}: ${value.name} (sold out)`}
              onClick={
                onSelectValue && !value.crossProduct
                  ? (event) => {
                      event.preventDefault();
                      onSelectValue(option.name, value.name);
                    }
                  : undefined
              }
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
