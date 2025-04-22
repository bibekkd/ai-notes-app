'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNotes } from "@/lib/hooks/use-notes";
import { NoteCard } from "@/components/notes/notes-card";
import { NoteForm } from "@/components/notes/notes-form";
import { EmptyState } from "@/components/notes/empty-state";
import { Navbar } from "@/components/layout/navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Note } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  // const router = useRouter();
  
  const { notes, isLoading, createNote, updateNote, deleteNote } = useNotes();
  
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const handleCreateNote = async (data: { title: string; content: string; summary?: string }) => {
    try {
      const result = await createNote.mutateAsync(data);
      console.log("Note created successfully:", result);
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating note:", error);
    }
  };
  
  const handleUpdateNote = async (data: { title: string; content: string; summary?: string }) => {
    if (editingNote) {
      try {
        await updateNote.mutateAsync({
          id: editingNote.id,
          ...data
        });
        setEditingNote(null);
      } catch (error) {
        console.error("Error updating note:", error);
      }
    }
  };

  const handleDeleteNote = async () => {
    if (noteToDelete) {
      try {
        await deleteNote.mutateAsync(noteToDelete);
        setNoteToDelete(null);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
  };

  const handleDeleteClick = (noteId: string) => {
    setNoteToDelete(noteId);
    setIsDeleteDialogOpen(true);
  };

  // Issue #3: Handle case where notes might be undefined
  const notesList = notes || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Notes</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Note
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : notesList.length === 0 ? (
          <EmptyState onCreateNote={() => setIsCreateDialogOpen(true)} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notesList.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </main>

      
      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          
          if (!open) {
            // Reset form state if needed
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Note</DialogTitle>
          </DialogHeader>
          <NoteForm
            onSubmit={handleCreateNote}
            isSubmitting={createNote.isPending}
          />
        </DialogContent>
      </Dialog>

      
      <Dialog 
        open={!!editingNote} 
        onOpenChange={(open) => {
          if (!open) setEditingNote(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <NoteForm
              initialData={editingNote}
              onSubmit={handleUpdateNote}
              isSubmitting={updateNote.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setNoteToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}