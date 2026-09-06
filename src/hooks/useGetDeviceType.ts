import { useEffect, useState } from "react";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
};

export const useIsMobile = () => {
  return useMediaQuery("(max-width: 768px)");
};

export const useIsTablet = () => {
  return useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
};
