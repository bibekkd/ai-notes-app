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
      } catch (error: unknown) {
        console.error(
          "Summarization error:",
          axios.isAxiosError(error) ? error.response?.data || error.message : error
        );
        throw new Error(
          axios.isAxiosError(error)
            ? error.response?.data?.error || error.message || "Failed to generate summary"
            : error instanceof Error
              ? error.message
              : "Failed to generate summary"
        );
      }
    },
  });
}
