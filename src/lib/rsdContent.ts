export type RsdScenario = 'left_out' | 'ignored' | 'awkward' | 'hurtful';

export const scenarios = [
  { id: 'left_out' as RsdScenario, emoji: '👥', label: 'Left out of plans' },
  { id: 'ignored' as RsdScenario, emoji: '📱', label: 'Read and ignored' },
  { id: 'awkward' as RsdScenario, emoji: '😬', label: 'Something awkward happened' },
  { id: 'hurtful' as RsdScenario, emoji: '💬', label: 'Said or heard something hurtful' },
];

export const intensityLabels = [
  'A little sting',
  'It hurts',
  'Really hurts',
  'Hard to think',
  'Everything is loud',
];

export const contentMap: Record<RsdScenario, { reframes: string[]; actions: { text: string; desc: string }[] }> = {
  left_out: {
    reframes: [
      "Maybe they planned it before I was around. I don't know for sure.",
      "This hurts, but it doesn't mean they don't like me.",
      "I've been left out before and it passed. It'll pass again.",
    ],
    actions: [
      { text: 'Do something for yourself', desc: 'Pick one thing that\'s just for you right now' },
      { text: 'Reach out to one person', desc: 'Not about this — just connect with someone' },
      { text: 'Write it out, then close it', desc: 'Get it out of your head and put it somewhere' },
    ],
  },
  ignored: {
    reframes: [
      "People miss messages all the time. It might not be about me.",
      "I can't know what's going on for them right now.",
      "This sting is real, but it's not proof of anything yet.",
    ],
    actions: [
      { text: 'Put the phone down for 10 minutes', desc: 'Break the checking loop' },
      { text: 'Do something with your hands', desc: 'Redirect the restless energy' },
      { text: 'Send one low-stakes message to someone else', desc: 'Shift the social energy' },
    ],
  },
  awkward: {
    reframes: [
      "Awkward moments feel huge in the moment and small later.",
      "They probably aren't thinking about it as much as I am.",
      "I've survived awkward moments before. I'll survive this one.",
    ],
    actions: [
      { text: 'Let 24 hours pass before deciding anything', desc: 'Future-you will have more info' },
      { text: 'Talk to someone who wasn\'t there', desc: 'Outside perspective helps' },
      { text: 'Do something completely unrelated', desc: 'Give your brain a different track' },
    ],
  },
  hurtful: {
    reframes: [
      "People say things they don't fully mean when they're in their own stuff.",
      "I get to decide how much weight this gets.",
      "I don't have to fix this in the next five minutes.",
    ],
    actions: [
      { text: 'Name what you need right now', desc: 'To vent? To be distracted? To sit with it?' },
      { text: 'Wait before responding', desc: 'RSD responses you\'ll regret are common — give it time' },
      { text: 'Find one trusted person', desc: 'You don\'t have to process this alone' },
    ],
  },
};

export const affirmations = [
  "RSD isn't forever. You just showed that.",
  "Your feelings were real. So was your strength.",
  "The sting will fade. You already helped it along.",
  "ADHD brains feel big. That's not weakness — it's volume.",
];
