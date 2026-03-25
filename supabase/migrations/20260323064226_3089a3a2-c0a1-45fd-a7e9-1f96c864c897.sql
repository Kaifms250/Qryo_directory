
-- Rooms table for custom chat rooms
CREATE TABLE public.rooms (
  id TEXT PRIMARY KEY DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  community TEXT NOT NULL,
  creator_username TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public rooms" ON public.rooms
  FOR SELECT TO public USING (is_private = false);

CREATE POLICY "Anyone can read private rooms" ON public.rooms
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can create rooms" ON public.rooms
  FOR INSERT TO public WITH CHECK (true);

-- Room members (for private rooms and admin tracking)
CREATE TABLE public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_kicked BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, username)
);

ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read room members" ON public.room_members
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can join rooms" ON public.room_members
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update room members" ON public.room_members
  FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Polls table
CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community TEXT NOT NULL,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
  creator_username TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read polls" ON public.polls
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can create polls" ON public.polls
  FOR INSERT TO public WITH CHECK (true);

-- Poll votes
CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, username)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read votes" ON public.poll_votes
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can vote" ON public.poll_votes
  FOR INSERT TO public WITH CHECK (true);

-- Pinned messages
CREATE TABLE public.pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  community TEXT NOT NULL,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
  pinned_by TEXT NOT NULL,
  pinned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id)
);

ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pinned" ON public.pinned_messages
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can pin" ON public.pinned_messages
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can unpin" ON public.pinned_messages
  FOR DELETE TO public USING (true);

-- User badges / reputation
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  badge_type TEXT NOT NULL,
  given_by TEXT NOT NULL,
  community TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(username, badge_type, given_by, community)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read badges" ON public.user_badges
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can give badges" ON public.user_badges
  FOR INSERT TO public WITH CHECK (true);

-- User profiles/preferences (username-based, no auth)
CREATE TABLE public.user_profiles (
  username TEXT PRIMARY KEY,
  avatar_style TEXT NOT NULL DEFAULT 'default',
  chat_bubble_color TEXT NOT NULL DEFAULT 'default',
  bio TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles" ON public.user_profiles
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can create profiles" ON public.user_profiles
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can update profiles" ON public.user_profiles
  FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Add room_id and message_type columns to messages
ALTER TABLE public.messages ADD COLUMN room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN message_type TEXT NOT NULL DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN metadata JSONB DEFAULT '{}';

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pinned_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_badges;
