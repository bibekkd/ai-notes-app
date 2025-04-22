export type User = {
  id: string;
  email?: string;
  avatar_url?: string;
};
  
export type Note = {
  id: string;
  title: string;
  content: string;
  summary?: string;
  created_at: string;
  updated_at: string;
};

