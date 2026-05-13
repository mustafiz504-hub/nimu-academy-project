import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash, state } = useLocation() as { pathname: string; hash: string; state: any };

  useEffect(() => {
    // Check for state-based scrolling (preferred for "Book a Class")
    if (state?.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    // Handle standard hashes
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Default to top
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  }, [pathname, hash, state]);

  return null;
};

export default ScrollToTop;
