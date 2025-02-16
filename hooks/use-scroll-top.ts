import { useCallback, useEffect, useState } from 'react';

export function useScroll(ref: React.RefObject<HTMLElement>) {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    setIsScrolled(target.scrollTop > 0);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return isScrolled;
}
