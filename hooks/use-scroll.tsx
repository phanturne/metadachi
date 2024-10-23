import { useEffect, useState } from "react";
import { throttle } from "lodash";

export function useScroll(threshold = 0, throttleMs = 100) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > threshold);
    }, throttleMs);

    window.addEventListener("scroll", handleScroll);

    // Call handleScroll once to set initial state
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold, throttleMs]);

  return isScrolled;
}
