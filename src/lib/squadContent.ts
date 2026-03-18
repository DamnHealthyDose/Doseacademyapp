export interface AmbientMember {
  initials: string;
  subject: string;
  minutesIn: number;
}

export const ambientPool: AmbientMember[] = [
  { initials: "AK", subject: "Math", minutesIn: 12 },
  { initials: "JL", subject: "English", minutesIn: 8 },
  { initials: "MR", subject: "Bio", minutesIn: 23 },
  { initials: "TS", subject: "History", minutesIn: 4 },
  { initials: "NP", subject: "Spanish", minutesIn: 17 },
  { initials: "CW", subject: "Chem", minutesIn: 31 },
  { initials: "DH", subject: "Reading", minutesIn: 6 },
  { initials: "ZB", subject: "Art project", minutesIn: 19 },
  { initials: "EF", subject: "Essay", minutesIn: 14 },
  { initials: "GK", subject: "Geography", minutesIn: 9 },
  { initials: "LM", subject: "French", minutesIn: 22 },
  { initials: "RW", subject: "Coding", minutesIn: 11 },
];

export const subjects = ['Math', 'Reading', 'Essay / Writing', 'Science', 'History', 'Other'];

export const durationOptions = [
  { emoji: '🏃', minutes: 10, label: '10 min', desc: 'Just getting started' },
  { emoji: '⚡', minutes: 15, label: '15 min', desc: 'Quick burst' },
  { emoji: '🔥', minutes: 25, label: '25 min', desc: 'Full Pomodoro' },
  { emoji: '🧠', minutes: 45, label: '45 min', desc: 'Deep work mode' },
];

export const checkinFeelings = ['Focused', 'Tired', 'Proud', 'Meh', 'Relieved', 'Still scattered'];

export function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
