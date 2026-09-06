import { useEffect } from "react";

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
};

const isMobileDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const hasMobileUserAgent = /android|iphone|ipad|ipod|mobile/.test(userAgent);
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const hasMobileViewport = window.matchMedia("(max-width: 900px)").matches;

  return hasMobileUserAgent || (hasCoarsePointer && hasMobileViewport);
};

const requestAppFullscreen = () => {
  const fullscreenDocument = document as FullscreenDocument;
  if (document.fullscreenElement || fullscreenDocument.webkitFullscreenElement) {
    return Promise.resolve();
  }

  const root = document.documentElement as FullscreenElement;
  const requestFullscreen =
    root.requestFullscreen?.bind(root) ??
    root.webkitRequestFullscreen?.bind(root);

  if (!requestFullscreen) return Promise.resolve();

  return Promise.resolve(requestFullscreen({ navigationUI: "hide" }));
};

export const useMobileFullscreenOnTap = () => {
  useEffect(() => {
    if (!isMobileDevice()) return;

    const handleTap = () => {
      void requestAppFullscreen().catch(() => {
        // Some mobile browsers, especially iOS Safari, reject fullscreen for normal pages.
      });
    };

    window.addEventListener("click", handleTap, {
      capture: true,
    });
    window.addEventListener("touchend", handleTap, {
      capture: true,
    });

    return () => {
      window.removeEventListener("click", handleTap, true);
      window.removeEventListener("touchend", handleTap, true);
    };
  }, []);
};
