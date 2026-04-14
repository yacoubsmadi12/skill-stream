export interface Badge {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  minPoints: number;
  color: string;
  gradient: string;
  linkedinTitle: string;
}

export const BADGES: Badge[] = [
  {
    id: 'starter',
    name: 'Starter',
    nameAr: 'Starter',
    icon: '🌱',
    description: 'You started your knowledge sharing journey',
    minPoints: 0,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600',
    linkedinTitle: 'Zain Knowledge Starter Badge',
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    nameAr: 'Rising Star',
    icon: '⭐',
    description: 'You proved your excellence in knowledge sharing',
    minPoints: 100,
    color: 'text-yellow-400',
    gradient: 'from-yellow-400 to-orange-500',
    linkedinTitle: 'Zain Knowledge Rising Star Badge',
  },
  {
    id: 'expert',
    name: 'Expert',
    nameAr: 'Expert',
    icon: '🔥',
    description: 'Certified expert in knowledge sharing',
    minPoints: 500,
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-red-600',
    linkedinTitle: 'Zain Knowledge Expert Badge',
  },
  {
    id: 'zain_champion',
    name: 'Zain Champion',
    nameAr: 'Zain Champion',
    icon: '💎',
    description: 'One of the top contributors on Zain Knowledge',
    minPoints: 1000,
    color: 'text-cyan-400',
    gradient: 'from-cyan-400 to-blue-600',
    linkedinTitle: 'Zain Knowledge Champion Badge',
  },
  {
    id: 'legend',
    name: 'Zain Legend',
    nameAr: 'Zain Legend',
    icon: '🏆',
    description: 'A legend of knowledge in the Zain family',
    minPoints: 2500,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-600',
    linkedinTitle: 'Zain Knowledge Legend Badge',
  },
];

export function getBadge(points: number): Badge {
  const sorted = [...BADGES].sort((a, b) => b.minPoints - a.minPoints);
  return sorted.find(b => points >= b.minPoints) || BADGES[0];
}

export function getNextBadge(points: number): Badge | null {
  const sorted = [...BADGES].sort((a, b) => a.minPoints - b.minPoints);
  return sorted.find(b => b.minPoints > points) || null;
}

export function shareOnLinkedIn(badge: Badge, userName: string) {
  const text = encodeURIComponent(
    `🎉 I just earned the "${badge.name}" badge on Zain Knowledge!\n\n` +
    `${badge.icon} ${badge.description}\n\n` +
    `Proud to be contributing to knowledge sharing at Zain Jordan.\n\n` +
    `#ZainKnowledge #LearningAndDevelopment #Zain`
  );
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://zain.com')}&summary=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
}

export const POINTS_RULES = [
  { action: 'video_approved', points: 50, label: 'Video approved' },
  { action: 'video_liked', points: 5, label: 'Like received' },
  { action: 'comment_received', points: 3, label: 'Comment received' },
  { action: 'new_follower', points: 10, label: 'New follower' },
  { action: 'views_milestone', points: 10, label: 'Every 100 views' },
  { action: 'request_completed', points: 20, label: 'Request completed' },
];
