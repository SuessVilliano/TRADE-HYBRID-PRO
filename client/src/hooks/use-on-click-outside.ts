import { RefObject, useEffect } from 'react';

type Event = MouseEvent | TouchEvent;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void,
  excludeRefs: RefObject<HTMLElement>[] = []
) {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref.current;
      const target = event.target as Node;

      // Do nothing if the ref is not yet assigned to an element
      // or if clicking ref element or descendent elements
      if (!el || el.contains(target)) {
        return;
      }

      // Do nothing if clicking on excluded elements
      for (const excludeRef of excludeRefs) {
        if (excludeRef.current && excludeRef.current.contains(target)) {
          return;
        }
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, excludeRefs]);
}