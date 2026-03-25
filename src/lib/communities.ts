import gamingImg from "@/assets/community-gaming.jpg";
import techImg from "@/assets/community-tech.jpg";
import animeImg from "@/assets/community-anime.jpg";
import natureImg from "@/assets/community-nature.jpg";
import musicImg from "@/assets/community-music.jpg";
import artImg from "@/assets/community-art.jpg";

export interface Community {
  id: string;
  name: string;
  description: string;
  image: string;
  theme: string;
  emoji: string;
  memberCount: number;
}

export const communities: Community[] = [
  {
    id: "gaming",
    name: "Gaming",
    description: "Level up with fellow gamers",
    image: gamingImg,
    theme: "theme-gaming",
    emoji: "🎮",
    memberCount: 2847,
  },
  {
    id: "tech",
    name: "Tech",
    description: "Build the future together",
    image: techImg,
    theme: "theme-tech",
    emoji: "⚡",
    memberCount: 3214,
  },
  {
    id: "anime",
    name: "Anime",
    description: "Your otaku sanctuary",
    image: animeImg,
    theme: "theme-anime",
    emoji: "🌸",
    memberCount: 4102,
  },
  {
    id: "nature",
    name: "Nature",
    description: "Explore the wild world",
    image: natureImg,
    theme: "theme-nature",
    emoji: "🌿",
    memberCount: 1923,
  },
  {
    id: "music",
    name: "Music",
    description: "Feel the rhythm",
    image: musicImg,
    theme: "theme-music",
    emoji: "🎵",
    memberCount: 2651,
  },
  {
    id: "art",
    name: "Art",
    description: "Create without limits",
    image: artImg,
    theme: "theme-art",
    emoji: "🎨",
    memberCount: 1876,
  },
];
