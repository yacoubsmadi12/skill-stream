import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { categories, comments, profiles, request_messages, service_requests, videos, user_follows, points_history, notifications } from './schema.js';
import { eq, desc, asc, sql, and } from 'drizzle-orm';
import { seedIfEmpty, fillVideoUrls } from './seed.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '60mb' }));

// ── In-memory settings ─────────────────────────────────────────
const settings: Record<string, string> = {
  approval_required: 'true', // 'true' = videos need approval, 'false' = auto-publish
};

app.get('/api/settings', (_req, res) => res.json(settings));
app.patch('/api/settings', (req, res) => {
  Object.assign(settings, req.body);
  res.json(settings);
});

// ── Points helper ──────────────────────────────────────────────
async function awardPoints(userId: string, action: string, points: number, description: string) {
  await db.insert(points_history).values({ user_id: userId, action, points, description });
  await db.update(profiles).set({ points: sql`points + ${points}` }).where(eq(profiles.user_id, userId));
}

// ── Notification helper ────────────────────────────────────────
async function createNotification(userId: string, actorName: string, actorAvatar: string, type: string, videoTitle = '', videoId = '') {
  if (!userId || !actorName) return;
  await db.insert(notifications).values({ user_id: userId, actor_name: actorName, actor_avatar: actorAvatar, type, video_title: videoTitle, video_id: videoId });
}

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
    const isAdmin = v.isAdmin === true;
    const finalStatus = isAdmin ? 'approved' : v.status;
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
      status: finalStatus,
    }).returning();
    await db.update(profiles).set({ videos_count: sql`videos_count + 1` }).where(eq(profiles.user_id, v.userId));
    if (isAdmin) {
      const allProfiles = await db.select().from(profiles);
      for (const p of allProfiles) {
        if (p.user_id !== v.userId) {
          await createNotification(p.user_id, v.userName, v.userAvatar || '', 'admin_video', v.title, row.id);
        }
      }
    }
    res.json({ ...row, comments: [] });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.patch('/api/videos/:id', async (req, res) => {
  try {
    const prev = await db.select().from(videos).where(eq(videos.id, req.params.id));
    const [row] = await db.update(videos).set(req.body).where(eq(videos.id, req.params.id)).returning();
    // Award points when video is approved
    if (req.body.status === 'approved' && prev[0]?.status !== 'approved') {
      await awardPoints(row.user_id, 'video_approved', 50, `Your video was approved: ${row.title}`);
    }
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
    // Award points every 100 views
    if (row.views % 100 === 0) {
      await awardPoints(row.user_id, 'views_milestone', 10, `Your video "${row.title}" reached ${row.views} views`);
    }
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post('/api/videos/:id/like', async (req, res) => {
  try {
    const { userId, liked, actorName, actorAvatar } = req.body;
    const delta = liked ? 1 : -1;
    const [row] = await db.update(videos)
      .set({ likes: sql`likes + ${delta}` })
      .where(eq(videos.id, req.params.id))
      .returning();
    if (liked && row.user_id !== userId) {
      await awardPoints(row.user_id, 'video_liked', 5, `Someone liked your video: ${row.title}`);
      await createNotification(row.user_id, actorName || 'Someone', actorAvatar || '', 'like', row.title, row.id);
    }
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
    const { videoId, userName, text, userId, userAvatar } = req.body;
    const [row] = await db.insert(comments).values({
      video_id: videoId,
      user_id: userId || '',
      user_name: userName,
      text,
    }).returning();
    const [vid] = await db.select().from(videos).where(eq(videos.id, videoId));
    if (vid && vid.user_id !== userId) {
      await awardPoints(vid.user_id, 'comment_received', 3, `New comment on your video: ${vid.title}`);
      await createNotification(vid.user_id, userName || 'Someone', userAvatar || '', 'comment', vid.title, vid.id);
    }
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

app.post('/api/profiles/upsert', async (req, res) => {
  try {
    const { userId, name, department } = req.body;
    const existing = await db.select().from(profiles).where(eq(profiles.user_id, userId));
    if (existing.length > 0) return res.json(existing[0]);
    const [row] = await db.insert(profiles).values({ user_id: userId, name, department: department || '' }).returning();
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

// ── Follows ───────────────────────────────────────────────────
app.get('/api/follows', async (req, res) => {
  try {
    const { userId } = req.query as { userId: string };
    const rows = await db.select().from(user_follows).where(eq(user_follows.follower_id, userId));
    res.json(rows.map(r => r.following_id));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.get('/api/followers/:userId', async (req, res) => {
  try {
    const rows = await db.select().from(user_follows).where(eq(user_follows.following_id, req.params.userId));
    const followerIds = rows.map(r => r.follower_id);
    if (followerIds.length === 0) return res.json([]);
    const followerProfiles = await db.select().from(profiles).where(
      sql`${profiles.user_id} = ANY(${followerIds})`
    );
    return res.json(followerProfiles);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

app.post('/api/follows', async (req, res) => {
  try {
    const { followerId, followingId, actorName, actorAvatar } = req.body;
    const existing = await db.select().from(user_follows)
      .where(and(eq(user_follows.follower_id, followerId), eq(user_follows.following_id, followingId)));
    if (existing.length > 0) return res.json({ ok: true });
    await db.insert(user_follows).values({ follower_id: followerId, following_id: followingId });
    await db.update(profiles).set({ followers: sql`followers + 1` }).where(eq(profiles.user_id, followingId));
    await db.update(profiles).set({ following: sql`following + 1` }).where(eq(profiles.user_id, followerId));
    await awardPoints(followingId, 'new_follower', 10, 'You have a new follower');
    await createNotification(followingId, actorName || 'Someone', actorAvatar || '', 'follow');
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

app.delete('/api/follows', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    await db.delete(user_follows)
      .where(and(eq(user_follows.follower_id, followerId), eq(user_follows.following_id, followingId)));
    await db.update(profiles).set({ followers: sql`GREATEST(followers - 1, 0)` }).where(eq(profiles.user_id, followingId));
    await db.update(profiles).set({ following: sql`GREATEST(following - 1, 0)` }).where(eq(profiles.user_id, followerId));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ── Points ────────────────────────────────────────────────────
app.get('/api/points/:userId', async (req, res) => {
  try {
    const rows = await db.select().from(points_history)
      .where(eq(points_history.user_id, req.params.userId))
      .orderBy(desc(points_history.created_at))
      .limit(50);
    res.json(rows);
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
    // Award points when request is completed with a rating
    if (req.body.status === 'completed' && req.body.rating) {
      const bonus = req.body.rating === 5 ? 15 : 0;
      await awardPoints(row.to_user_id, 'request_completed', 20 + bonus, `Service request completed${bonus > 0 ? ' — 5-star rating bonus!' : ''}`);
    }
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

// ── Video Save ────────────────────────────────────────────────
app.post('/api/videos/:id/save', async (req, res) => {
  try {
    const { actorName, actorAvatar, saved } = req.body;
    const [vid] = await db.select().from(videos).where(eq(videos.id, req.params.id));
    if (vid && saved && vid.user_id !== req.body.actorId) {
      await createNotification(vid.user_id, actorName, actorAvatar || '', 'save', vid.title, vid.id);
    }
    const delta = saved ? 1 : -1;
    const [row] = await db.update(videos)
      .set({ saves: sql`GREATEST(saves + ${delta}, 0)` })
      .where(eq(videos.id, req.params.id))
      .returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ── Notifications ──────────────────────────────────────────────
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const rows = await db.select().from(notifications)
      .where(eq(notifications.user_id, req.params.userId))
      .orderBy(desc(notifications.created_at))
      .limit(50);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, req.params.id));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.patch('/api/notifications/read-all/:userId', async (req, res) => {
  try {
    await db.update(notifications).set({ read: true }).where(eq(notifications.user_id, req.params.userId));
    res.json({ ok: true });
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
  await fillVideoUrls();
});
