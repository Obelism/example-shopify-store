"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { Dialog, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import type { Image as ImageType } from "@/lib/media/types";

import styles from "./lightbox.module.css";

const LightboxContext = createContext<((image: ImageType) => void) | null>(null);

export function Lightbox({ label, children }: { label: string; children: ReactNode }) {
  const [activeImage, setActiveImage] = useState<ImageType | null>(null);
  const close = useCallback(() => setActiveImage(null), []);

  return (
    <LightboxContext.Provider value={setActiveImage}>
      {children}

      <Dialog
        backdrop="blur"
        className={styles.dialog}
        open={activeImage !== null}
        onOpenChange={(open) => !open && close()}
      >
        <DialogTitle className="sr-only">{`${label} enlarged`}</DialogTitle>

        <DialogClose className={styles.close}>
          <Icon name="x" size={20} />
          <span className="sr-only">Close</span>
        </DialogClose>

        {activeImage && (
          <div
            className={styles.frame}
            style={{ aspectRatio: `${activeImage.width} / ${activeImage.height}` }}
          >
            <Image
              src={activeImage.url}
              alt={activeImage.altText || `${label} enlarged`}
              fill
              className={styles.image}
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
    <button type="button" onClick={() => open?.(image)} className={styles.trigger}>
      {children}
    </button>
  );
}
