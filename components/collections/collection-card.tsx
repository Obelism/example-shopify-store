import { cn } from "cn";
import Image from "next/image";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import type { CollectionWithThumbnail } from "@/lib/collections/types";

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
      className={cn("group/card flex flex-col h-full overflow-hidden", className)}
      href={`/collections/${handle}`}
    >
      <div
        data-slot="collection-card-image"
        className="relative aspect-4/3 overflow-hidden bg-muted"
      >
        {thumbnail ? (
          <Image
            alt={thumbnail.altText || title}
            className="object-cover transition-opacity duration-300 group-hover/card:opacity-85"
            fill
            sizes="100vw"
            src={thumbnail.url}
          />
        ) : (
          <ImagePlaceholder className="size-full" />
        )}
      </div>
      <div className="grid gap-1 pt-3">
        <h2
          data-slot="collection-card-title"
          className="font-serif text-2xl italic text-foreground"
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm leading-6 text-muted-foreground line-clamp-2">{description}</p>
        )}
      </div>
    </Link>
  );
}
