// Re-export the auto-generated client
export { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  community: string;
  username: string;
  content: string;
  created_at: string;
  room_id?: string | null;
  message_type: string;
  metadata?: Record<string, unknown>;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  community: string;
  creator_username: string;
  is_private: boolean;
  created_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  username: string;
  role: string;
  is_muted: boolean;
  is_kicked: boolean;
  joined_at: string;
}

export interface Poll {
  id: string;
  community: string;
  room_id?: string | null;
  creator_username: string;
  question: string;
  options: string[];
  created_at: string;
  expires_at?: string | null;
}

export interface PollVote {
  id: string;
  poll_id: string;
  username: string;
  option_index: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  username: string;
  badge_type: string;
  given_by: string;
  community: string;
  created_at: string;
}

export interface UserProfile {
  username: string;
  avatar_style: string;
  chat_bubble_color: string;
  bio: string;
  created_at: string;
  updated_at: string;
}
