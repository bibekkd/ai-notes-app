import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface EmptyStateProps {
  onCreateNote: () => void;
}

export function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium">No notes yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Get started by creating your first note.
      </p>
      <Button onClick={onCreateNote} className="mt-4">
        Create Note
      </Button>
    </div>
  );
}