import { useSyncExternalStore } from 'react';

const QUERY = '(min-width: 768px)';

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};

/** True at >=768px (tablet and desktop: two panes). Correct on the first render and live on resize. */
export const useIsWide = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
