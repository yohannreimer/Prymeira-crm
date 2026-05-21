import { useState, useCallback } from "react";

export function useBulkSelection<T extends { id: string | number }>() {
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const toggle = useCallback((id: string | number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((records: T[]) => {
    setSelected((prev) =>
      prev.size === records.length
        ? new Set()
        : new Set(records.map((r) => r.id)),
    );
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const isSelected = useCallback(
    (id: string | number) => selected.has(id),
    [selected],
  );

  return { selected, toggle, toggleAll, clear, isSelected };
}
