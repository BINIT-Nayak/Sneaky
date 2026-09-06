import { getOptimizedImageUrl, getResponsiveImageSrcSet } from "./imageUrl";

describe("imageUrl", () => {
  it("optimizes Unsplash image dimensions and quality", () => {
    expect(
      getOptimizedImageUrl(
        "https://images.unsplash.com/photo-1?auto=format&fit=crop&w=900&q=80",
        { quality: 70, width: 640 },
      ),
    ).toBe(
      "https://images.unsplash.com/photo-1?auto=format&fit=crop&w=640&q=70",
    );
  });

  it("leaves non-Unsplash images unchanged", () => {
    expect(
      getOptimizedImageUrl("https://cdn.example.com/image.jpg", {
        quality: 70,
        width: 640,
      }),
    ).toBe("https://cdn.example.com/image.jpg");
  });

  it("builds a responsive srcset", () => {
    expect(
      getResponsiveImageSrcSet("https://images.unsplash.com/photo-1", [
        360,
        640,
      ]),
    ).toBe(
      "https://images.unsplash.com/photo-1?auto=format&fit=crop&w=360&q=72 360w, https://images.unsplash.com/photo-1?auto=format&fit=crop&w=640&q=72 640w",
    );
  });
});
