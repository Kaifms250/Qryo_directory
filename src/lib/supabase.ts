// Re-export the auto-generated client
export { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  community: string;
  username: string;
  content: string;
  created_at: string;
}
