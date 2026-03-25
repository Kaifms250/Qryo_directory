
-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community TEXT NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read messages
CREATE POLICY "Anyone can read messages"
ON public.messages
FOR SELECT
USING (true);

-- Allow anyone to insert messages (anonymous chat)
CREATE POLICY "Anyone can send messages"
ON public.messages
FOR INSERT
WITH CHECK (true);

-- Index for fast community queries
CREATE INDEX idx_messages_community_created ON public.messages (community, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
