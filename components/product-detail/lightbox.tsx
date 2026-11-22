"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { Dialog, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import type { Image as ImageType } from "@/lib/media/types";

const LightboxContext = createContext<((image: ImageType) => void) | null>(null);

export function Lightbox({ label, children }: { label: string; children: ReactNode }) {
  const [activeImage, setActiveImage] = useState<ImageType | null>(null);
  const close = useCallback(() => setActiveImage(null), []);

  return (
    <LightboxContext.Provider value={setActiveImage}>
      {children}

      <Dialog
        backdrop="blur"
        className="place-items-center p-10"
        open={activeImage !== null}
        onOpenChange={(open) => !open && close()}
      >
        <DialogTitle className="sr-only">{`${label} enlarged`}</DialogTitle>

        <DialogClose className="pointer-events-auto absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-opacity hover:opacity-80 focus:ring-2 focus:ring-white focus:outline-hidden">
          <Icon name="x" className="size-5" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {activeImage && (
          <div
            className="pointer-events-none relative h-full max-w-full bg-background"
            style={{ aspectRatio: `${activeImage.width} / ${activeImage.height}` }}
          >
            <Image
              src={activeImage.url}
              alt={activeImage.altText || `${label} enlarged`}
              fill
              className="object-contain"
              sizes="100vw"
              fetchPriority="high"
              loading="eager"
            />
          </div>
        )}
      </Dialog>
    </LightboxContext.Provider>
  );
}

export function LightboxTrigger({ image, children }: { image: ImageType; children: ReactNode }) {
  const open = useContext(LightboxContext);
  return (
    <button
      type="button"
      onClick={() => open?.(image)}
      className="relative h-full w-full cursor-zoom-in"
    >
      {children}
    </button>
  );
}
