import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter} from "@/components/ui/card";
import { Note } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { useSummarize } from "@/lib/hooks/use-summarize";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NoteFormProps {
  initialData?: Partial<Note>;
  onSubmit: (data: { title: string; content: string; summary?: string }) => void;
  isSubmitting: boolean;
}

export function NoteForm({ initialData, onSubmit, isSubmitting }: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [error, setError] = useState<string | null>(null);
  
  const summarizeMutation = useSummarize();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!content.trim()) {
      setError("Content is required");
      return;
    }
    onSubmit({ title, content, summary });
  };

  const handleSummarize = async () => {
    if (!content.trim()) {
      setError("Please add some content before summarizing");
      return;
    }
    
    setError(null);
    try {
      const result = await summarizeMutation.mutateAsync(content);
      setSummary(result);
    } catch (error: any) {
      console.error("Failed to summarize:", error);
      setError(error.message || "Failed to summarize your note. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-none">
        <CardContent className="space-y-4 p-0">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="min-h-[200px] w-full"
              required
            />
          </div>
          
          {content.trim().length > 0 && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleSummarize}
                disabled={summarizeMutation.isPending}
              >
                {summarizeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Summarize with Gemini
              </Button>
            </div>
          )}
          
          {(summary || summarizeMutation.isPending) && (
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={summarizeMutation.isPending ? "Generating summary..." : "Summary will appear here..."}
                className="min-h-[100px] w-full"
                disabled={summarizeMutation.isPending}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 p-0 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? "Update Note" : "Create Note"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}