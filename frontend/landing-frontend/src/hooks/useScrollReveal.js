import { useEffect } from 'react';

/**
 * Custom hook using IntersectionObserver to trigger scroll-reveal animations with index staggering.
 * Respects prefers-reduced-motion.
 */
export function useScrollReveal() {
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      revealElements.forEach((el) => el.classList.add('in'));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            revealObserver.unobserve(el);

            const parent = el.parentElement;
            const siblings = Array.from(parent ? parent.children : []);
            const index = siblings.indexOf(el);
            const staggerDelay = (index >= 0 ? index : 0) * 60;

            setTimeout(() => {
              el.classList.add('in');
            }, staggerDelay);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => revealObserver.observe(el));

    return () => revealObserver.disconnect();
  }, []);
}
