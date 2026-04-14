import { db } from './db.js';
import { categories, profiles, videos } from './schema.js';
import { eq, count, or, isNull } from 'drizzle-orm';

// Real YouTube URLs for each demo video topic (from channels that always allow embedding)
const DEMO_VIDEO_URLS: Record<string, string> = {
  'مقدمة في الذكاء الاصطناعي للاتصالات':   'https://www.youtube.com/watch?v=ad79nYk2keg',
  'أفضل ممارسات تطوير API في بيئات الإنتاج': 'https://www.youtube.com/watch?v=OVvTv9Hy91Q',
  'فن التفاوض مع العملاء المؤسسيين':         'https://www.youtube.com/watch?v=llKvV8_T95M',
  'تحليل بيانات شبكات الجيل الخامس 5G':     'https://www.youtube.com/watch?v=GEx_d0SjvS0',
  'الأمن السيبراني في بيئات العمل الحديثة':   'https://www.youtube.com/watch?v=inWWhr5tnEA',
  'بناء تطبيقات React عالية الأداء':          'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
  'مهارات خدمة العملاء في الاتصالات':         'https://www.youtube.com/watch?v=eIho2S0ZahI',
  'التعلم الآلي للمبتدئين — من الصفر للاحتراف': 'https://www.youtube.com/watch?v=f_uwKZIAeM0',
  'Cloud Architecture لمشاريع المؤسسات':      'https://www.youtube.com/watch?v=M988_fsOSWo',
  'نماذج اللغة الكبيرة LLMs في الأعمال':     'https://www.youtube.com/watch?v=5sLYAQS9sWQ',
};

// Runs at startup: fills in video_url for any existing seeded videos that are missing it
export async function fillVideoUrls() {
  const empty = await db.select({ id: videos.id, title: videos.title })
    .from(videos)
    .where(or(isNull(videos.video_url), eq(videos.video_url, '')));

  if (empty.length === 0) return;

  let filled = 0;
  for (const row of empty) {
    const url = DEMO_VIDEO_URLS[row.title];
    if (url) {
      await db.update(videos).set({ video_url: url }).where(eq(videos.id, row.id));
      filled++;
    }
  }
  if (filled > 0) console.log(`[seed] Filled ${filled} missing video URLs.`);
}

export async function seedIfEmpty() {
  const existing = await db.select().from(videos).limit(1);
  if (existing.length > 0) return;

  console.log('[seed] Seeding initial data...');

  const COLORS = [
    'from-purple-600 to-indigo-700',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-pink-500 to-rose-600',
    'from-orange-500 to-amber-600',
    'from-violet-500 to-purple-700',
    'from-sky-500 to-cyan-600',
    'from-lime-500 to-green-600',
  ];

  // Categories
  await db.insert(categories).values([
    { name: 'AI & Data', icon: '🤖', count: 3 },
    { name: 'Network', icon: '📡', count: 1 },
    { name: 'Engineering', icon: '⚙️', count: 4 },
    { name: 'Sales', icon: '💼', count: 1 },
    { name: 'IT Security', icon: '🔒', count: 1 },
    { name: 'Leadership', icon: '🌟', count: 0 },
    { name: 'Customer Care', icon: '🎯', count: 1 },
    { name: 'Innovation', icon: '💡', count: 0 },
  ]).onConflictDoNothing();

  // Profiles for mock users
  await db.insert(profiles).values([
    {
      user_id: '1',
      name: 'System Administrator',
      department: 'IT',
      bio: 'Platform administrator with full access to all system features.',
      skills: ['System Admin', 'Security', 'DevOps'],
      years_experience: 10,
      rating: '4.9',
      total_ratings: 45,
      followers: 120,
      following: 15,
      videos_count: 8,
    },
    {
      user_id: '2',
      name: 'Ahmed Al-Rashid',
      department: 'Engineering',
      bio: 'Senior software engineer passionate about building scalable systems and sharing knowledge.',
      skills: ['React', 'Node.js', 'Cloud Architecture', 'TypeScript'],
      years_experience: 7,
      rating: '4.7',
      total_ratings: 38,
      followers: 210,
      following: 45,
      videos_count: 12,
    },
    {
      user_id: '3',
      name: 'Sara Mohammed',
      department: 'Sales',
      bio: 'Enterprise sales specialist with deep expertise in telecom solutions.',
      skills: ['B2B Sales', 'Negotiation', 'CRM', 'Market Analysis'],
      years_experience: 5,
      rating: '4.8',
      total_ratings: 29,
      followers: 178,
      following: 60,
      videos_count: 9,
    },
    {
      user_id: '4',
      name: 'Khalid Nasser',
      department: 'AI & Data',
      bio: 'Data scientist and AI enthusiast working on next-gen telecom intelligence.',
      skills: ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow'],
      years_experience: 6,
      rating: '4.9',
      total_ratings: 52,
      followers: 315,
      following: 32,
      videos_count: 15,
    },
  ]).onConflictDoNothing();

  // Demo videos — with real YouTube URLs so the feed is never empty
  await db.insert(videos).values([
    {
      user_id: '4', user_name: 'Khalid Nasser', user_department: 'AI & Data',
      title: 'مقدمة في الذكاء الاصطناعي للاتصالات',
      description: 'كيف يغير الذكاء الاصطناعي قطاع الاتصالات؟ نستعرض أبرز التطبيقات والفرص في هذا القطاع.',
      tags: ['AI', 'Telecom', 'ML'], category: 'AI & Data',
      video_url: DEMO_VIDEO_URLS['مقدمة في الذكاء الاصطناعي للاتصالات'],
      thumbnail_color: COLORS[1], likes: 142, saves: 67, views: 890, status: 'approved',
    },
    {
      user_id: '2', user_name: 'Ahmed Al-Rashid', user_department: 'Engineering',
      title: 'أفضل ممارسات تطوير API في بيئات الإنتاج',
      description: 'نتحدث عن تصميم APIs قابلة للتوسع ومرنة تناسب متطلبات المؤسسات الكبيرة.',
      tags: ['API', 'Backend', 'Engineering'], category: 'Engineering',
      video_url: DEMO_VIDEO_URLS['أفضل ممارسات تطوير API في بيئات الإنتاج'],
      thumbnail_color: COLORS[0], likes: 98, saves: 44, views: 612, status: 'approved',
    },
    {
      user_id: '3', user_name: 'Sara Mohammed', user_department: 'Sales',
      title: 'فن التفاوض مع العملاء المؤسسيين',
      description: 'استراتيجيات فعالة لإتمام الصفقات الكبيرة وبناء علاقات دائمة مع العملاء.',
      tags: ['Sales', 'Negotiation', 'B2B'], category: 'Sales',
      video_url: DEMO_VIDEO_URLS['فن التفاوض مع العملاء المؤسسيين'],
      thumbnail_color: COLORS[3], likes: 76, saves: 31, views: 445, status: 'approved',
    },
    {
      user_id: '4', user_name: 'Khalid Nasser', user_department: 'AI & Data',
      title: 'تحليل بيانات شبكات الجيل الخامس 5G',
      description: 'كيف نستخدم تحليل البيانات لتحسين جودة الشبكة وتجربة المستخدم في شبكات 5G.',
      tags: ['5G', 'Data Analysis', 'Network'], category: 'Network',
      video_url: DEMO_VIDEO_URLS['تحليل بيانات شبكات الجيل الخامس 5G'],
      thumbnail_color: COLORS[6], likes: 201, saves: 88, views: 1340, status: 'approved',
    },
    {
      user_id: '1', user_name: 'System Administrator', user_department: 'IT',
      title: 'الأمن السيبراني في بيئات العمل الحديثة',
      description: 'دليل شامل لحماية البنية التحتية الرقمية من التهديدات الأمنية المتطورة.',
      tags: ['Security', 'Cybersecurity', 'IT'], category: 'IT Security',
      video_url: DEMO_VIDEO_URLS['الأمن السيبراني في بيئات العمل الحديثة'],
      thumbnail_color: COLORS[4], likes: 165, saves: 72, views: 978, status: 'approved',
    },
    {
      user_id: '2', user_name: 'Ahmed Al-Rashid', user_department: 'Engineering',
      title: 'بناء تطبيقات React عالية الأداء',
      description: 'تقنيات التحسين والـ memoization والـ code splitting لتطبيقات React.',
      tags: ['React', 'Performance', 'Frontend'], category: 'Engineering',
      video_url: DEMO_VIDEO_URLS['بناء تطبيقات React عالية الأداء'],
      thumbnail_color: COLORS[7], likes: 113, saves: 59, views: 734, status: 'approved',
    },
    {
      user_id: '3', user_name: 'Sara Mohammed', user_department: 'Sales',
      title: 'مهارات خدمة العملاء في الاتصالات',
      description: 'كيفية التعامل مع العملاء بفاعلية وبناء ولاء العلامة التجارية.',
      tags: ['Customer Care', 'Communication', 'Skills'], category: 'Customer Care',
      video_url: DEMO_VIDEO_URLS['مهارات خدمة العملاء في الاتصالات'],
      thumbnail_color: COLORS[2], likes: 87, saves: 38, views: 521, status: 'approved',
    },
    {
      user_id: '4', user_name: 'Khalid Nasser', user_department: 'AI & Data',
      title: 'التعلم الآلي للمبتدئين — من الصفر للاحتراف',
      description: 'رحلة تعليمية متكاملة في مجال Machine Learning مع أمثلة تطبيقية من قطاع الاتصالات.',
      tags: ['ML', 'Python', 'Beginners'], category: 'AI & Data',
      video_url: DEMO_VIDEO_URLS['التعلم الآلي للمبتدئين — من الصفر للاحتراف'],
      thumbnail_color: COLORS[5], likes: 245, saves: 110, views: 1820, status: 'approved',
    },
    {
      user_id: '2', user_name: 'Ahmed Al-Rashid', user_department: 'Engineering',
      title: 'Cloud Architecture لمشاريع المؤسسات',
      description: 'تصميم بنية سحابية قابلة للتوسع وآمنة وفعالة من حيث التكلفة للشركات الكبيرة.',
      tags: ['Cloud', 'AWS', 'Architecture'], category: 'Engineering',
      video_url: DEMO_VIDEO_URLS['Cloud Architecture لمشاريع المؤسسات'],
      thumbnail_color: COLORS[0], likes: 134, saves: 65, views: 867, status: 'approved',
    },
    {
      user_id: '4', user_name: 'Khalid Nasser', user_department: 'AI & Data',
      title: 'نماذج اللغة الكبيرة LLMs في الأعمال',
      description: 'كيف تستفيد المؤسسات من ChatGPT وGemini وغيرها لتحسين الكفاءة التشغيلية.',
      tags: ['LLM', 'AI', 'Business'], category: 'AI & Data',
      video_url: DEMO_VIDEO_URLS['نماذج اللغة الكبيرة LLMs في الأعمال'],
      thumbnail_color: COLORS[1], likes: 189, saves: 93, views: 1205, status: 'approved',
    },
    {
      user_id: '2', user_name: 'Ahmed Al-Rashid', user_department: 'Engineering',
      title: 'مراجعة كود — بانتظار الموافقة',
      description: 'فيديو تجريبي بانتظار مراجعة الإدارة.',
      tags: ['Test'], category: 'Engineering',
      thumbnail_color: COLORS[2], likes: 0, saves: 0, views: 0, status: 'pending',
    },
  ]);

  console.log('[seed] Done — database populated with demo data.');
}
