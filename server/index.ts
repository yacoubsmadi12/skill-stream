import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { categories, comments, profiles, request_messages, service_requests, videos } from './schema.js';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { seedIfEmpty } from './seed.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

// ── Categories ────────────────────────────────────────────────
app.get('/api/categories', async (_req, res) => {
  try {
    const rows = await db.select().from(categories);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, icon } = req.body;
    const [row] = await db.insert(categories).values({ name, icon }).returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await db.delete(categories).where(eq(categories.id, req.params.id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ── Videos ────────────────────────────────────────────────────
app.get('/api/videos', async (_req, res) => {
  try {
    const [vids, coms] = await Promise.all([
      db.select().from(videos).orderBy(desc(videos.created_at)),
      db.select().from(comments).orderBy(asc(comments.created_at)),
    ]);
    const byVideo = new Map<string, typeof coms>();
    coms.forEach(c => {
      if (!byVideo.has(c.video_id)) byVideo.set(c.video_id, []);
      byVideo.get(c.video_id)!.push(c);
    });
    const result = vids.map(v => ({ ...v, comments: byVideo.get(v.id) || [] }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/videos', async (req, res) => {
  try {
    const v = req.body;
    const [row] = await db.insert(videos).values({
      user_id: v.userId,
      user_name: v.userName,
      user_avatar: v.userAvatar,
      user_department: v.userDepartment,
      title: v.title,
      description: v.description,
      tags: v.tags,
      category: v.category,
      video_url: v.videoUrl,
      thumbnail_color: v.thumbnailColor,
      status: v.status,
    }).returning();
    // Bump user videos_count
    await db.update(profiles).set({ videos_count: sql`videos_count + 1` }).where(eq(profiles.user_id, v.userId));
    res.json({ ...row, comments: [] });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.patch('/api/videos/:id', async (req, res) => {
  try {
    const [row] = await db.update(videos).set(req.body).where(eq(videos.id, req.params.id)).returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/videos/:id/view', async (req, res) => {
  try {
    const [row] = await db.update(videos)
      .set({ views: sql`views + 1` })
      .where(eq(videos.id, req.params.id))
      .returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.delete('/api/videos/:id', async (req, res) => {
  try {
    const [vid] = await db.select().from(videos).where(eq(videos.id, req.params.id));
    if (vid) {
      await db.update(profiles)
        .set({ videos_count: sql`GREATEST(videos_count - 1, 0)` })
        .where(eq(profiles.user_id, vid.user_id));
    }
    await db.delete(videos).where(eq(videos.id, req.params.id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ── Comments ──────────────────────────────────────────────────
app.post('/api/comments', async (req, res) => {
  try {
    const { videoId, userName, text, userId } = req.body;
    const [row] = await db.insert(comments).values({
      video_id: videoId,
      user_id: userId || '',
      user_name: userName,
      text,
    }).returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ── Profiles ──────────────────────────────────────────────────
app.get('/api/profiles', async (_req, res) => {
  try {
    const rows = await db.select().from(profiles);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/profiles', async (req, res) => {
  try {
    const p = req.body;
    const [row] = await db.insert(profiles).values(p).onConflictDoNothing().returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Upsert profile (create if not exists)
app.post('/api/profiles/upsert', async (req, res) => {
  try {
    const { userId, name, department } = req.body;
    const existing = await db.select().from(profiles).where(eq(profiles.user_id, userId));
    if (existing.length > 0) {
      return res.json(existing[0]);
    }
    const [row] = await db.insert(profiles).values({
      user_id: userId,
      name,
      department: department || '',
    }).returning();
    return res.json(row);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

app.patch('/api/profiles/:userId', async (req, res) => {
  try {
    const { name, department, bio, skills, years_experience, avatar } = req.body;
    const updates: Record<string, unknown> = { updated_at: new Date() };
    if (name !== undefined) updates.name = name;
    if (department !== undefined) updates.department = department;
    if (bio !== undefined) updates.bio = bio;
    if (skills !== undefined) updates.skills = skills;
    if (years_experience !== undefined) updates.years_experience = years_experience;
    if (avatar !== undefined) updates.avatar = avatar;
    const [row] = await db.update(profiles).set(updates).where(eq(profiles.user_id, req.params.userId)).returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ── Service Requests ──────────────────────────────────────────
app.get('/api/requests', async (_req, res) => {
  try {
    const [reqs, msgs] = await Promise.all([
      db.select().from(service_requests).orderBy(desc(service_requests.created_at)),
      db.select().from(request_messages).orderBy(asc(request_messages.created_at)),
    ]);
    const byReq = new Map<string, typeof msgs>();
    msgs.forEach(m => {
      if (!byReq.has(m.request_id)) byReq.set(m.request_id, []);
      byReq.get(m.request_id)!.push(m);
    });
    const result = reqs.map(r => ({ ...r, messages: byReq.get(r.id) || [] }));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const r = req.body;
    const [row] = await db.insert(service_requests).values({
      from_user_id: r.fromUserId,
      from_user_name: r.fromUserName,
      to_user_id: r.toUserId,
      to_user_name: r.toUserName,
      video_id: r.videoId,
      video_title: r.videoTitle,
      type: r.type,
      description: r.description,
      priority: r.priority,
      status: r.status,
    }).returning();
    res.json({ ...row, messages: [] });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.patch('/api/requests/:id', async (req, res) => {
  try {
    const [row] = await db.update(service_requests).set(req.body).where(eq(service_requests.id, req.params.id)).returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ── Request Messages ──────────────────────────────────────────
app.post('/api/requests/:id/messages', async (req, res) => {
  try {
    const { senderId, senderName, text } = req.body;
    const [row] = await db.insert(request_messages).values({
      request_id: req.params.id,
      sender_id: senderId,
      sender_name: senderName,
      text,
    }).returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = parseInt(process.env.PORT || '3001');
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
  await seedIfEmpty();
});
