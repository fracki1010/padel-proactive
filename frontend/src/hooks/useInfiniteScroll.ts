import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook genérico de infinite scroll basado en IntersectionObserver.
 * @param initialCount - Cuántos ítems mostrar inicialmente
 * @param increment - Cuántos ítems cargar por cada "página"
 * @param total - Total de ítems disponibles
 */
export function useInfiniteScroll(
  initialCount: number,
  increment: number,
  total: number,
) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = visibleCount < total;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + increment, total));
  }, [increment, total]);

  // Resetear cuando cambia el total (por ejemplo al filtrar)
  useEffect(() => {
    setVisibleCount(initialCount);
  }, [total, initialCount]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return { visibleCount, sentinelRef, hasMore };
}
