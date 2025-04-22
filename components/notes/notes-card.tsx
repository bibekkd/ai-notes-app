import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Note } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const formattedDate = formatDistanceToNow(new Date(note.updated_at), { addSuffix: true });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl truncate">{note.title}</CardTitle>
        <CardDescription>Updated {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {note.summary ? (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Summary:</p>
            <p className="text-sm line-clamp-3">{note.summary}</p>
          </div>
        ) : (
          <p className="line-clamp-4">{note.content}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(note)}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(note.id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}