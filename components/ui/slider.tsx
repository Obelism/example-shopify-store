"use client";

import { cn } from "cn";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import { Icon } from "@/components/ui/icon";

import styles from "./slider.module.css";

interface SliderContextValue {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  handleScroll: () => void;
  registerContainer: (node: HTMLDivElement | null) => void;
  scroll: (direction: "left" | "right") => void;
}

const SliderContext = createContext<SliderContextValue | null>(null);

function useSlider() {
  const context = useContext(SliderContext);
  if (!context) throw new Error("Slider parts must be used within Slider");
  return context;
}

function Slider({ className, children, ...props }: ComponentProps<"section">) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 1);
    setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth - 1);
  }, []);

  // Content may mount after the section, so measure from the scroller's own callback ref.
  const registerContainer = useCallback(
    (node: HTMLDivElement | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      containerRef.current = node;
      if (!node) return;

      updateScrollState();
      const resizeObserver = new ResizeObserver(updateScrollState);
      resizeObserver.observe(node);
      for (const child of node.children) resizeObserver.observe(child);
      const mutationObserver = new MutationObserver(() => {
        updateScrollState();
        for (const child of node.children) resizeObserver.observe(child);
      });
      mutationObserver.observe(node, { childList: true });
      cleanupRef.current = () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };
    },
    [updateScrollState],
  );

  const scroll = useCallback((direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    const firstItem = container.querySelector<HTMLElement>(`.${styles.item}`);
    const gap = Number.parseFloat(getComputedStyle(container).columnGap) || 0;
    const itemWidth = firstItem ? firstItem.offsetWidth + gap : container.clientWidth * 0.8;
    const visibleItems = Math.max(1, Math.floor(container.clientWidth / itemWidth));
    container.scrollBy({
      behavior: "smooth",
      left: (direction === "left" ? -1 : 1) * itemWidth * visibleItems,
    });
  }, []);

  return (
    <SliderContext.Provider
      value={{
        canScrollLeft,
        canScrollRight,
        handleScroll: updateScrollState,
        registerContainer,
        scroll,
      }}
    >
      <section className={cn(styles.slider, className)} {...props}>
        {children}
      </section>
    </SliderContext.Provider>
  );
}

function SliderHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(styles.header, className)} {...props} />;
}

function SliderNav({ className, ...props }: ComponentProps<"div">) {
  const { canScrollLeft, canScrollRight, scroll } = useSlider();
  const hidden = !canScrollLeft && !canScrollRight;
  return (
    <div className={cn(styles.nav, className)} data-hidden={hidden} {...props}>
      <button
        aria-label="Scroll left"
        className={styles.navButton}
        disabled={!canScrollLeft}
        onClick={() => scroll("left")}
        type="button"
      >
        <Icon name="chevron-left" size={20} />
      </button>
      <button
        aria-label="Scroll right"
        className={styles.navButton}
        disabled={!canScrollRight}
        onClick={() => scroll("right")}
        type="button"
      >
        <Icon name="chevron-right" size={20} />
      </button>
    </div>
  );
}

function SliderContent({ className, ...props }: ComponentProps<"div">) {
  const { handleScroll, registerContainer } = useSlider();
  return (
    <div
      ref={registerContainer}
      onScroll={handleScroll}
      className={cn(styles.content, className)}
      {...props}
    />
  );
}

function SliderItem({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(styles.item, className)} {...props} />;
}

export { Slider, SliderContent, SliderHeader, SliderItem, SliderNav };
