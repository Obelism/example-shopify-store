"use client";

import { cn } from "cn";
import {
  type ComponentProps,
  createContext,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from "react";

import { Icon } from "@/components/ui/icon";

import styles from "./dialog.module.css";

interface DialogContextValue {
  close: () => void;
  descriptionId: string;
  registerDescription: () => () => void;
  titleId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error("Dialog parts must render inside a Dialog");
  return context;
}

interface DialogProps extends Omit<ComponentProps<"dialog">, "open"> {
  backdrop?: "blur" | "dim" | "none";
  initialFocus?: RefObject<HTMLElement | null>;
  onCloseComplete?: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

function Dialog({
  backdrop = "dim",
  children,
  className,
  initialFocus,
  onCloseComplete,
  onOpenChange,
  open,
  ...props
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const openCount = useRef(0);
  const pressedBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const [descriptions, setDescriptions] = useState(0);
  const registerDescription = useCallback(() => {
    setDescriptions((count) => count + 1);
    return () => setDescriptions((count) => count - 1);
  }, []);
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  const show = useEffectEvent((dialog: HTMLDialogElement) => {
    openCount.current += 1;
    const root = document.documentElement;
    // The scroll lock hides the scrollbar; padding by its width keeps the page from shifting.
    if (!root.querySelector("dialog[open]")) {
      root.style.setProperty(
        "--dialog-scrollbar-width",
        `${window.innerWidth - root.clientWidth}px`,
      );
    }
    const opening = openCount.current;
    if (dialog.open) {
      dialog.dataset.open = "";
    } else {
      dialog.showModal();
      // The closed state paints for a frame first, so data-open transitions from it.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (openCount.current === opening) dialog.dataset.open = "";
        }),
      );
    }
    initialFocus?.current?.focus();
  });

  const hide = useEffectEvent((dialog: HTMLDialogElement) => {
    if (!mounted) return;
    openCount.current += 1;
    const closing = openCount.current;
    delete dialog.dataset.open;
    const transitions = dialog.getAnimations({ subtree: true }).map(({ finished }) => finished);
    void Promise.allSettled(transitions).then(() => {
      if (openCount.current !== closing) return;
      // Modal until the exit ends; the browser may have closed it already, e.g. on a repeated Escape.
      if (dialog.open) dialog.close();
      setMounted(false);
      onCloseComplete?.();
    });
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) show(dialog);
    else hide(dialog);
  }, [open]);

  return (
    <DialogContext
      value={{
        close: () => onOpenChange(false),
        descriptionId,
        registerDescription,
        titleId,
      }}
    >
      <dialog
        {...props}
        aria-describedby={descriptions > 0 ? descriptionId : undefined}
        aria-labelledby={titleId}
        className={cn(styles.dialog, className)}
        data-backdrop={backdrop}
        onCancel={(event) => {
          event.preventDefault();
          onOpenChange(false);
        }}
        // A press that starts inside and ends on the backdrop is a text selection, not a dismissal.
        onClick={(event) => {
          if (pressedBackdrop.current && event.target === event.currentTarget) onOpenChange(false);
          pressedBackdrop.current = false;
        }}
        onClose={() => {
          if (open) onOpenChange(false);
        }}
        onPointerDown={(event) => {
          pressedBackdrop.current = event.target === event.currentTarget;
        }}
        ref={ref}
      >
        {mounted ? children : null}
      </dialog>
    </DialogContext>
  );
}

function DialogClose({ className, onClick, type = "button", ...props }: ComponentProps<"button">) {
  const { close } = useDialog();
  return (
    <button
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) close();
      }}
      type={type}
      {...props}
    />
  );
}

interface DialogPanelProps extends ComponentProps<"div"> {
  showCloseButton?: boolean;
}

function DialogPanel({ children, className, showCloseButton = true, ...props }: DialogPanelProps) {
  return (
    <div className={cn(styles.panel, className)} {...props}>
      {children}
      {showCloseButton ? (
        <DialogClose className={styles.close}>
          <Icon name="x" size={16} />
          <span className="sr-only">Close</span>
        </DialogClose>
      ) : null}
    </div>
  );
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(styles.header, className)} {...props} />;
}

function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(styles.footer, className)} {...props} />;
}

function DialogTitle({ className, ...props }: ComponentProps<"h2">) {
  const { titleId } = useDialog();
  return <h2 className={cn(styles.title, className)} id={titleId} {...props} />;
}

function DialogDescription({ className, ...props }: ComponentProps<"p">) {
  const { descriptionId, registerDescription } = useDialog();
  useEffect(registerDescription, [registerDescription]);
  return <p className={cn(styles.description, className)} id={descriptionId} {...props} />;
}

export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
};
