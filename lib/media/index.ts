import type { Image } from "./types";

export function getAspectRatio(image: Image | null | undefined): number | undefined {
  return image?.width && image.height ? image.width / image.height : undefined;
}
