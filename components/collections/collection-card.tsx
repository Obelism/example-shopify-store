import { cn } from "cn";
import Image from "next/image";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import type { CollectionWithThumbnail } from "@/lib/collections/types";

import styles from "./collection-card.module.css";

export interface CollectionCardProps {
  className?: string;
  collection: CollectionWithThumbnail;
  viewCollectionLabel: string;
}

export function CollectionCard({
  className,
  collection,
  viewCollectionLabel,
}: CollectionCardProps) {
  const { description, handle, thumbnail, title } = collection;

  return (
    <Link
      aria-label={`${viewCollectionLabel}: ${title}`}
      className={cn(styles.card, className)}
      href={`/collections/${handle}`}
    >
      <div className={styles.media}>
        {thumbnail ? (
          <Image
            alt={thumbnail.altText || title}
            className={styles.image}
            fill
            sizes="100vw"
            src={thumbnail.url}
          />
        ) : (
          <ImagePlaceholder className={styles.placeholder} />
        )}
      </div>
      <div className={styles.body}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </Link>
  );
}
