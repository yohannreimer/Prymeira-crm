import { type ReactNode } from "react";
import { Trash2 } from "lucide-react";

interface BulkActionToolbarProps {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  children?: ReactNode;
}

export const BulkActionToolbar = ({
  count,
  onClear,
  onDelete,
  children,
}: BulkActionToolbarProps) => {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full bg-foreground px-4 py-2.5 shadow-lg text-background">
      <span className="text-sm font-medium">
        {count} selecionado{count !== 1 ? "s" : ""}
      </span>
      {children}
      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
        type="button"
      >
        <Trash2 className="h-4 w-4" />
        Excluir
      </button>
      <button
        onClick={onClear}
        className="text-sm text-background/60 hover:text-background transition-colors"
        type="button"
      >
        Cancelar
      </button>
    </div>
  );
};
