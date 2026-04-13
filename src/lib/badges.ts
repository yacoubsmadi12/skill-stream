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
    nameAr: 'مبتدئ',
    icon: '🌱',
    description: 'بدأت رحلتك في مشاركة المعرفة',
    minPoints: 0,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600',
    linkedinTitle: 'Zain Knowledge Starter Badge',
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    nameAr: 'نجم صاعد',
    icon: '⭐',
    description: 'أثبتت تميزك في مشاركة المعرفة',
    minPoints: 100,
    color: 'text-yellow-400',
    gradient: 'from-yellow-400 to-orange-500',
    linkedinTitle: 'Zain Knowledge Rising Star Badge',
  },
  {
    id: 'expert',
    name: 'Expert',
    nameAr: 'خبير',
    icon: '🔥',
    description: 'خبير معتمد في مشاركة المعرفة',
    minPoints: 500,
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-red-600',
    linkedinTitle: 'Zain Knowledge Expert Badge',
  },
  {
    id: 'zain_champion',
    name: 'Zain Champion',
    nameAr: 'بطل زين',
    icon: '💎',
    description: 'من أبرز المساهمين في منصة زين للمعرفة',
    minPoints: 1000,
    color: 'text-cyan-400',
    gradient: 'from-cyan-400 to-blue-600',
    linkedinTitle: 'Zain Knowledge Champion Badge',
  },
  {
    id: 'legend',
    name: 'Zain Legend',
    nameAr: 'أسطورة زين',
    icon: '🏆',
    description: 'أسطورة المعرفة في عائلة زين',
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
    `🎉 حصلت على بادج "${badge.nameAr}" في منصة زين للمعرفة!\n\n` +
    `${badge.icon} ${badge.description}\n\n` +
    `أنا فخور بمساهمتي في نشر المعرفة داخل عائلة زين.\n\n` +
    `#زين_المعرفة #ZainKnowledge #LearningAndDevelopment #Zain`
  );
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://zain.com')}&summary=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
}

export const POINTS_RULES = [
  { action: 'video_approved', points: 50, label: 'فيديو تمت الموافقة عليه' },
  { action: 'video_liked', points: 5, label: 'إعجاب بفيديوك' },
  { action: 'comment_received', points: 3, label: 'تعليق على فيديوك' },
  { action: 'new_follower', points: 10, label: 'متابع جديد' },
  { action: 'views_milestone', points: 10, label: 'كل 100 مشاهدة' },
  { action: 'request_completed', points: 20, label: 'إتمام طلب خدمة' },
];
