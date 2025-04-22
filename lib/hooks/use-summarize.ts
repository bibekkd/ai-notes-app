import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export function useSummarize() {
  return useMutation({
    mutationFn: async (text: string): Promise<string> => {
      try {
        const { data } = await axios.post('/api/summarize', { text });
        
        if (!data.summary) {
          throw new Error("No summary was generated");
        }
        
        return data.summary;
      } catch (error: any) {
        console.error("Summarization error:", error.response?.data || error);
        throw new Error(error.response?.data?.error || error.message || "Failed to generate summary");
      }
    },
  });
}