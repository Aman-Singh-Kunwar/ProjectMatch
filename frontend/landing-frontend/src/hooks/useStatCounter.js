import { useEffect } from 'react';

/**
 * Custom hook using IntersectionObserver to trigger smooth count-up animations for stat numbers.
 * Respects prefers-reduced-motion.
 */
export function useStatCounter() {
  useEffect(() => {
    const statElements = document.querySelectorAll('.stat-count-target');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            observer.unobserve(el);

            const format = el.getAttribute('data-format') || 'plain';
            const target = parseInt(el.getAttribute('data-count'), 10);
            const suffix = el.getAttribute('data-suffix') || '';

            if (prefersReduced) {
              el.textContent = format === 'ratio' ? `1${suffix}` : `${target.toLocaleString()}${suffix}`;
              return;
            }

            if (format === 'ratio') {
              el.style.opacity = '0';
              el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
              el.style.transform = 'scale(0.95)';
              requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'scale(1)';
                el.textContent = `1${suffix}`;
              });
              return;
            }

            const duration = 1200;
            const startTime = performance.now();

            const animateCount = (currentTime) => {
              const elapsedTime = currentTime - startTime;
              const progress = Math.min(elapsedTime / duration, 1);
              const easeOutProgress = 1 - Math.pow(1 - progress, 3);
              const currentVal = Math.floor(easeOutProgress * target);

              el.textContent = `${currentVal.toLocaleString()}${suffix}`;

              if (progress < 1) {
                requestAnimationFrame(animateCount);
              } else {
                el.textContent = `${target.toLocaleString()}${suffix}`;
              }
            };

            requestAnimationFrame(animateCount);
          }
        });
      },
      { threshold: 0.2 }
    );

    statElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
