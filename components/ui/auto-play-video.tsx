"use client";

import { cn } from "cn";
import Image from "next/image";
import { type ComponentProps, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Icon } from "@/components/ui/icon";

import styles from "./auto-play-video.module.css";

interface AutoPlayVideoPreviewImage {
  src: string;
  alt: string;
}

interface AutoPlayVideoProps extends Omit<
  ComponentProps<"video">,
  "autoPlay" | "loop" | "muted" | "onCanPlay" | "playsInline" | "ref"
> {
  previewImage?: AutoPlayVideoPreviewImage | null;
  previewImageFetchPriority?: "auto" | "high" | "low";
  previewImageLoading?: "eager" | "lazy";
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function AutoPlayVideo({
  previewImage,
  previewImageFetchPriority,
  previewImageLoading,
  className,
  ...props
}: AutoPlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [playRequested, setPlayRequested] = useState<boolean>();
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    prefersReducedMotion,
    () => false,
  );
  const playing = playRequested ?? !reducedMotion;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (!playing) {
      el.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [playing]);

  return (
    <>
      {previewImage && !videoReady && (
        <Image
          src={previewImage.src}
          alt={previewImage.alt}
          fill
          className={cn(styles.preview, className)}
          sizes="100vw"
          fetchPriority={previewImageFetchPriority}
          loading={previewImageLoading}
          draggable={false}
        />
      )}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        onCanPlay={() => setVideoReady(true)}
        className={cn(styles.video, className)}
        data-ready={videoReady}
        {...props}
      />
      <button
        type="button"
        aria-label={playing ? "Pause video" : "Play video"}
        className={styles.toggle}
        onClick={() => setPlayRequested(!playing)}
      >
        {playing ? <Icon name="pause" size={16} /> : <Icon name="play" size={16} />}
      </button>
    </>
  );
}
