export interface Video {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userDepartment: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  videoUrl: string;
  thumbnailColor: string;
  likes: number;
  comments: Comment[];
  saves: number;
  views: number;
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  videoId: string;
  videoTitle: string;
  type: 'consultation' | 'help' | 'task';
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'info_requested';
  messages: RequestMessage[];
  rating?: number;
  feedback?: string;
  createdAt: string;
}

export interface RequestMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  department: string;
  bio: string;
  skills: string[];
  yearsExperience: number;
  avatar: string;
  rating: number;
  totalRatings: number;
  followers: number;
  following: number;
  videosCount: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const VIDEO_COLORS = [
  'from-primary/80 to-accent/80',
  'from-accent/80 to-primary/80',
  'from-success/60 to-accent/60',
  'from-warning/60 to-primary/60',
  'from-primary/60 to-success/60',
];

export const CATEGORIES: Category[] = [
  { id: '1', name: 'IT & Infrastructure', icon: '🖥️', count: 24 },
  { id: '2', name: 'AI & Machine Learning', icon: '🧠', count: 18 },
  { id: '3', name: 'Sales & Marketing', icon: '📊', count: 15 },
  { id: '4', name: 'Network & Telecom', icon: '📡', count: 32 },
  { id: '5', name: 'Customer Service', icon: '🎧', count: 12 },
  { id: '6', name: 'Leadership', icon: '🚀', count: 8 },
  { id: '7', name: 'Security', icon: '🔒', count: 11 },
  { id: '8', name: 'Cloud & DevOps', icon: '☁️', count: 20 },
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'v1',
    userId: '2',
    userName: 'Ahmed Al-Rashid',
    userAvatar: '',
    userDepartment: 'Engineering',
    title: '5G Network Optimization Tips',
    description: 'Quick guide on optimizing 5G network configurations for enterprise deployments. Learn key parameters and best practices.',
    tags: ['5G', 'Network', 'Optimization'],
    category: 'Network & Telecom',
    videoUrl: '',
    thumbnailColor: VIDEO_COLORS[0],
    likes: 142,
    comments: [
      { id: 'c1', userId: '3', userName: 'Sara Mohammed', text: 'Very helpful! Can you do one on SA vs NSA?', createdAt: '2024-03-10' },
      { id: 'c2', userId: '4', userName: 'Khalid Nasser', text: 'Great explanation 🔥', createdAt: '2024-03-11' },
    ],
    saves: 38,
    views: 1240,
    createdAt: '2024-03-09',
    status: 'approved',
  },
  {
    id: 'v2',
    userId: '3',
    userName: 'Sara Mohammed',
    userAvatar: '',
    userDepartment: 'Sales',
    title: 'Enterprise Client Pitch Framework',
    description: 'My proven framework for pitching telecom solutions to enterprise clients. Includes objection handling.',
    tags: ['Sales', 'Pitch', 'Enterprise'],
    category: 'Sales & Marketing',
    videoUrl: '',
    thumbnailColor: VIDEO_COLORS[1],
    likes: 89,
    comments: [
      { id: 'c3', userId: '2', userName: 'Ahmed Al-Rashid', text: 'This framework is gold!', createdAt: '2024-03-12' },
    ],
    saves: 52,
    views: 876,
    createdAt: '2024-03-11',
    status: 'approved',
  },
  {
    id: 'v3',
    userId: '4',
    userName: 'Khalid Nasser',
    userAvatar: '',
    userDepartment: 'AI & Data',
    title: 'ML Model for Churn Prediction',
    description: 'Building a machine learning model to predict customer churn using our telecom data. Python + scikit-learn walkthrough.',
    tags: ['AI', 'ML', 'Python', 'Churn'],
    category: 'AI & Machine Learning',
    videoUrl: '',
    thumbnailColor: VIDEO_COLORS[2],
    likes: 203,
    comments: [
      { id: 'c4', userId: '2', userName: 'Ahmed Al-Rashid', text: 'What accuracy are you getting?', createdAt: '2024-03-14' },
      { id: 'c5', userId: '3', userName: 'Sara Mohammed', text: 'Can this be applied to upselling too?', createdAt: '2024-03-14' },
    ],
    saves: 91,
    views: 2100,
    createdAt: '2024-03-13',
    status: 'approved',
  },
  {
    id: 'v4',
    userId: '2',
    userName: 'Ahmed Al-Rashid',
    userAvatar: '',
    userDepartment: 'Engineering',
    title: 'Kubernetes for Telecom Workloads',
    description: 'How we containerized our core network functions using Kubernetes. Real-world lessons and pitfalls.',
    tags: ['Kubernetes', 'Cloud', 'DevOps'],
    category: 'Cloud & DevOps',
    videoUrl: '',
    thumbnailColor: VIDEO_COLORS[3],
    likes: 167,
    comments: [],
    saves: 73,
    views: 1560,
    createdAt: '2024-03-15',
    status: 'approved',
  },
  {
    id: 'v5',
    userId: '3',
    userName: 'Sara Mohammed',
    userAvatar: '',
    userDepartment: 'Sales',
    title: 'CRM Integration Best Practices',
    description: 'How to leverage our CRM system effectively for managing telecom enterprise accounts.',
    tags: ['CRM', 'Sales', 'Integration'],
    category: 'Sales & Marketing',
    videoUrl: '',
    thumbnailColor: VIDEO_COLORS[4],
    likes: 56,
    comments: [],
    saves: 22,
    views: 430,
    createdAt: '2024-03-16',
    status: 'pending',
  },
  {
    id: 'v6',
    userId: '4',
    userName: 'Khalid Nasser',
    userAvatar: '',
    userDepartment: 'AI & Data',
    title: 'Network Anomaly Detection with AI',
    description: 'Using deep learning to detect network anomalies in real-time. TensorFlow implementation guide.',
    tags: ['AI', 'Security', 'Deep Learning'],
    category: 'Security',
    videoUrl: '',
    thumbnailColor: VIDEO_COLORS[0],
    likes: 245,
    comments: [
      { id: 'c6', userId: '2', userName: 'Ahmed Al-Rashid', text: 'This saved us hours of manual monitoring!', createdAt: '2024-03-18' },
    ],
    saves: 104,
    views: 3200,
    createdAt: '2024-03-17',
    status: 'approved',
  },
];

export const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: 'r1',
    fromUserId: '3',
    fromUserName: 'Sara Mohammed',
    toUserId: '2',
    toUserName: 'Ahmed Al-Rashid',
    videoId: 'v1',
    videoTitle: '5G Network Optimization Tips',
    type: 'consultation',
    description: 'Need help optimizing our regional 5G deployment. Can we schedule a 30-min call?',
    priority: 'high',
    status: 'accepted',
    messages: [
      { id: 'm1', senderId: '3', senderName: 'Sara Mohammed', text: 'Hi Ahmed, loved your video. We need similar optimization for our region.', createdAt: '2024-03-10' },
      { id: 'm2', senderId: '2', senderName: 'Ahmed Al-Rashid', text: 'Sure! Let\'s set up a call. What time works for you?', createdAt: '2024-03-10' },
    ],
    createdAt: '2024-03-10',
  },
  {
    id: 'r2',
    fromUserId: '2',
    fromUserName: 'Ahmed Al-Rashid',
    toUserId: '4',
    toUserName: 'Khalid Nasser',
    videoId: 'v3',
    videoTitle: 'ML Model for Churn Prediction',
    type: 'task',
    description: 'Can you help build a churn prediction model for our enterprise segment?',
    priority: 'medium',
    status: 'pending',
    messages: [],
    createdAt: '2024-03-14',
  },
];

export const MOCK_PROFILES: UserProfile[] = [
  {
    userId: '2',
    name: 'Ahmed Al-Rashid',
    department: 'Engineering',
    bio: 'Senior Network Engineer with 8 years in telecom. Passionate about 5G and cloud-native network functions.',
    skills: ['5G', 'Network Architecture', 'Kubernetes', 'Python', 'SDN'],
    yearsExperience: 8,
    avatar: '',
    rating: 4.8,
    totalRatings: 24,
    followers: 156,
    following: 43,
    videosCount: 2,
  },
  {
    userId: '3',
    name: 'Sara Mohammed',
    department: 'Sales',
    bio: 'Enterprise Sales Lead. Specializing in B2B telecom solutions and strategic account management.',
    skills: ['Enterprise Sales', 'CRM', 'Account Management', 'Negotiation'],
    yearsExperience: 6,
    avatar: '',
    rating: 4.6,
    totalRatings: 18,
    followers: 98,
    following: 67,
    videosCount: 2,
  },
  {
    userId: '4',
    name: 'Khalid Nasser',
    department: 'AI & Data',
    bio: 'Data Scientist building AI solutions for telecom. Expert in ML, deep learning, and network analytics.',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'Data Analytics', 'NLP'],
    yearsExperience: 5,
    avatar: '',
    rating: 4.9,
    totalRatings: 31,
    followers: 234,
    following: 28,
    videosCount: 2,
  },
];
