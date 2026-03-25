import { useState, useEffect, useCallback } from "react";
import { supabase, type UserProfile } from "@/lib/supabase";

export const AVATAR_STYLES = [
  { id: "default", gradient: "from-primary to-accent" },
  { id: "ocean", gradient: "from-blue-500 to-cyan-400" },
  { id: "sunset", gradient: "from-orange-500 to-pink-500" },
  { id: "forest", gradient: "from-green-500 to-emerald-400" },
  { id: "royal", gradient: "from-purple-600 to-indigo-500" },
  { id: "fire", gradient: "from-red-500 to-yellow-500" },
  { id: "midnight", gradient: "from-gray-800 to-blue-900" },
  { id: "candy", gradient: "from-pink-400 to-purple-400" },
];

export const BUBBLE_COLORS = [
  { id: "default", label: "Default", class: "bg-primary" },
  { id: "ocean", label: "Ocean", class: "bg-blue-600" },
  { id: "sunset", label: "Sunset", class: "bg-orange-600" },
  { id: "forest", label: "Forest", class: "bg-green-700" },
  { id: "royal", label: "Royal", class: "bg-purple-700" },
  { id: "fire", label: "Fire", class: "bg-red-600" },
];

export function useUserProfile(username: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!username) return;
    supabase
      .from("user_profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile(data as UserProfile);
        else {
          // Create profile on first visit
          supabase.from("user_profiles").insert({ username }).select().single()
            .then(({ data: newProfile }) => {
              if (newProfile) setProfile(newProfile as UserProfile);
            });
        }
      });
  }, [username]);

  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, "avatar_style" | "chat_bubble_color" | "bio">>) => {
    const { data } = await supabase
      .from("user_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("username", username)
      .select()
      .single();
    if (data) setProfile(data as UserProfile);
  }, [username]);

  return { profile, updateProfile };
}

export function useProfilesCache() {
  const [cache, setCache] = useState<Record<string, UserProfile>>({});

  const fetchProfile = useCallback(async (username: string) => {
    if (cache[username]) return cache[username];
    const { data } = await supabase.from("user_profiles").select("*").eq("username", username).maybeSingle();
    if (data) {
      setCache((prev) => ({ ...prev, [username]: data as UserProfile }));
      return data as UserProfile;
    }
    return null;
  }, [cache]);

  return { cache, fetchProfile };
}
