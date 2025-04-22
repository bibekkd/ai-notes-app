import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Note } from '@/lib/types';

export function useNotes() {
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ['notes'],
    queryFn: async (): Promise<Note[]> => {
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return [];
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching notes:", error);
        throw error;
      }
      
      return data as Note[];
    },
    
    retry: 1,
    retryDelay: 1000,
  });
  
  
  const createNote = useMutation({
    mutationFn: async (noteData: { title: string; content: string; summary?: string }) => {
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Authentication required to create notes");
      }
      
      try {
        
        const { data, error } = await supabase
          .from('notes')
          .insert([{
            ...noteData,
            user_id: sessionData.session.user.id 
          }])
          .select()
          .single();
  
        if (error) {
          console.error("Error creating note:", error);
          throw error;
        }
        
        if (!data) {
          throw new Error("Failed to create note - no data returned");
        }
        
        return data as Note;
      } catch (error: any) {
        console.error("Error creating note:", error);
        throw new Error(`Error creating note: ${error.message || JSON.stringify(error)}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async (note: Partial<Note> & { id: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({ 
          title: note.title, 
          content: note.content,
          summary: note.summary,
          updated_at: new Date().toISOString(),
        })
        .eq('id', note.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating note:", error);
        throw error;
      }
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', data.id] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error("Error deleting note:", error);
        throw error;
      }
      return noteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    notes: notesQuery.data || [],
    isLoading: notesQuery.isLoading,
    error: notesQuery.error,
    createNote,
    updateNote,
    deleteNote,
  };
}

export function useNote(noteId: string | null) {
  return useQuery({
    queryKey: ['note', noteId],
    queryFn: async (): Promise<Note | null> => {
      if (!noteId) return null;
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();
      
      if (error) {
        // Check if the error is because the note wasn't found
        if (error.code === 'PGRST116') {
          return null; // Note not found
        }
        console.error("Error fetching note:", error);
        throw error;
      }
      
      return data as Note;
    },
    enabled: !!noteId,
  });
}

