type ImageOptions = {
  quality?: number;
  width: number;
};

const UNSPLASH_HOST_SUFFIX = "images.unsplash.com";

export const getOptimizedImageUrl = (
  imageUrl: string,
  { quality = 72, width }: ImageOptions,
) => {
  try {
    const url = new URL(imageUrl);

    if (!url.hostname.endsWith(UNSPLASH_HOST_SUFFIX)) {
      return imageUrl;
    }

    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality));

    return url.toString();
  } catch {
    return imageUrl;
  }
};

export const getResponsiveImageSrcSet = (
  imageUrl: string,
  widths: number[],
  quality?: number,
) =>
  widths
    .map((width) => `${getOptimizedImageUrl(imageUrl, { quality, width })} ${width}w`)
    .join(", ");
