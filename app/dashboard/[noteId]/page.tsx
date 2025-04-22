'use client';

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useNote } from "@/lib/hooks/use-notes";
import { Navbar } from "@/components/layout/navbar";
import { NoteForm } from "@/components/notes/notes-form";
import { ChevronLeft } from "lucide-react";
import { useNotes } from "@/lib/hooks/use-notes";

export default function EditNotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = typeof params.noteId === 'string' ? params.noteId : null;
  const { data: note, isLoading, error } = useNote(noteId);
  const { updateNote } = useNotes();

  const handleUpdateNote = async (data: { title: string; content: string; summary?: string }) => {
    if (noteId) {
      await updateNote.mutateAsync({
        id: noteId,
        ...data
      });
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center h-64">
            <h3 className="text-xl font-medium mb-2">Note not found</h3>
            <Button onClick={handleBack}>Back to Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={handleBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <NoteForm
          initialData={note}
          onSubmit={handleUpdateNote}
          isSubmitting={updateNote.isPending}
        />
      </main>
    </div>
  );
}