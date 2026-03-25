export const icebreakers: Record<string, string[]> = {
  gaming: [
    "🎮 What game are you grinding right now?",
    "🏆 What's your proudest gaming achievement?",
    "🎯 PC, console, or mobile gamer?",
    "🕹️ If you could live in any game world, which one?",
    "👾 What's the hardest boss you've ever beaten?",
  ],
  tech: [
    "⚡ What's the coolest thing you've built recently?",
    "💻 Tabs or spaces? Choose wisely!",
    "🤖 What tech trend are you most excited about?",
    "🔧 What's in your tech stack?",
    "🚀 What side project are you working on?",
  ],
  anime: [
    "🌸 What's your all-time favorite anime?",
    "📺 Sub or dub? Defend your choice!",
    "🎭 Which anime character do you relate to most?",
    "📖 Manga first or anime first?",
    "⭐ What anime made you cry the hardest?",
  ],
  nature: [
    "🌿 What's the most beautiful place you've visited?",
    "🦁 What's your spirit animal?",
    "🏔️ Mountains or beaches?",
    "🌅 Best sunrise or sunset you've seen?",
    "🌻 Do you have a garden?",
  ],
  music: [
    "🎵 What song is stuck in your head right now?",
    "🎤 Karaoke song of choice?",
    "🎸 What instrument do you play (or wish you could)?",
    "🎧 What's your go-to playlist vibe?",
    "🎶 Best concert you've ever been to?",
  ],
  art: [
    "🎨 What's your favorite art medium?",
    "🖌️ Digital or traditional art?",
    "🏛️ Favorite artist or art movement?",
    "✨ What inspires your creativity?",
    "🖼️ What are you working on right now?",
  ],
};

export function getRandomIcebreaker(community: string): string {
  const list = icebreakers[community] || icebreakers.gaming;
  return list[Math.floor(Math.random() * list.length)];
}
