import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Video {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_department: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  video_url: string;
  thumbnail_color: string;
  likes: number;
  saves: number;
  views: number;
  status: string;
  created_at: string;
  updated_at: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  video_id: string;
  video_title: string;
  type: string;
  description: string;
  priority: string;
  status: string;
  rating: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  messages: RequestMessage[];
}

export interface RequestMessage {
  id: string;
  request_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  department: string;
  bio: string;
  skills: string[];
  years_experience: number;
  avatar: string;
  rating: number;
  total_ratings: number;
  followers: number;
  following: number;
  videos_count: number;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  created_at: string;
}

export interface PointsHistoryEntry {
  id: string;
  user_id: string;
  action: string;
  points: number;
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_name: string;
  actor_avatar: string;
  type: string;
  video_title: string;
  video_id: string;
  read: boolean;
  created_at: string;
}

export interface AppSettings {
  approval_required: string;
}

interface DataContextType {
  videos: Video[];
  requests: ServiceRequest[];
  categories: Category[];
  profiles: UserProfile[];
  likedVideos: Set<string>;
  savedVideos: Set<string>;
  followedUsers: Set<string>;
  pointsHistory: PointsHistoryEntry[];
  notifications: Notification[];
  settings: AppSettings;
  loading: boolean;
  toggleLike: (videoId: string) => void;
  toggleSave: (videoId: string) => void;
  toggleFollow: (userId: string) => void;
  addComment: (videoId: string, userName: string, text: string, userId?: string) => void;
  addRequest: (req: { fromUserId: string; fromUserName: string; toUserId: string; toUserName: string; videoId: string; videoTitle: string; type: string; description: string; priority: string; status: string }) => void;
  updateRequestStatus: (reqId: string, status: string) => void;
  addRequestMessage: (reqId: string, senderId: string, senderName: string, text: string) => void;
  rateRequest: (reqId: string, rating: number, feedback: string) => void;
  updateVideoStatus: (videoId: string, status: string) => void;
  deleteVideo: (videoId: string) => void;
  addVideo: (video: { userId: string; userName: string; userAvatar: string; userDepartment: string; title: string; description: string; tags: string[]; category: string; videoUrl: string; thumbnailColor: string; status: string; isAdmin?: boolean }) => void;
  addCategory: (name: string, icon: string) => void;
  deleteCategory: (id: string) => void;
  incrementView: (videoId: string) => void;
  updateProfile: (userId: string, updates: { name?: string; department?: string; bio?: string; skills?: string[]; years_experience?: number; avatar?: string }) => Promise<void>;
  refreshData: () => void;
  loadPointsHistory: (userId: string) => Promise<void>;
  loadNotifications: (userId: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  followersList: UserProfile[];
  loadFollowers: (userId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryEntry[]>([]);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [followersList, setFollowersList] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ approval_required: 'true' });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('ztube_user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        setCurrentUser({ id: u.id, name: u.name || '', avatar: u.avatar || '' });
      } catch { /* ignore */ }
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vids, reqs, cats, profs, setts] = await Promise.all([
        apiFetch('/api/videos'),
        apiFetch('/api/requests'),
        apiFetch('/api/categories'),
        apiFetch('/api/profiles'),
        apiFetch('/api/settings'),
      ]);
      setVideos(vids);
      setRequests(reqs);
      setCategories(cats);
      setProfiles(profs);
      setSettings(setts);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = async (patch: Partial<AppSettings>) => {
    const updated = await apiFetch('/api/settings', { method: 'PATCH', body: JSON.stringify(patch) });
    setSettings(updated);
  };

  useEffect(() => {
    if (!currentUser?.id) return;
    apiFetch(`/api/follows?userId=${currentUser.id}`)
      .then((ids: string[]) => setFollowedUsers(new Set(ids)))
      .catch(() => {});
  }, [currentUser?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleLike = (videoId: string) => {
    setLikedVideos(prev => {
      const next = new Set(prev);
      const wasLiked = next.has(videoId);
      if (wasLiked) next.delete(videoId); else next.add(videoId);
      const video = videos.find(v => v.id === videoId);
      if (video) {
        apiFetch(`/api/videos/${videoId}/like`, {
          method: 'POST',
          body: JSON.stringify({
            userId: currentUser?.id,
            liked: !wasLiked,
            actorName: currentUser?.name,
            actorAvatar: currentUser?.avatar,
          }),
        }).catch(console.error);
        setVideos(vs => vs.map(v => v.id === videoId ? { ...v, likes: v.likes + (wasLiked ? -1 : 1) } : v));
      }
      return next;
    });
  };

  const toggleSave = (videoId: string) => {
    setSavedVideos(prev => {
      const next = new Set(prev);
      const wasSaved = next.has(videoId);
      if (wasSaved) next.delete(videoId); else next.add(videoId);
      apiFetch(`/api/videos/${videoId}/save`, {
        method: 'POST',
        body: JSON.stringify({
          actorId: currentUser?.id,
          actorName: currentUser?.name,
          actorAvatar: currentUser?.avatar,
          saved: !wasSaved,
        }),
      }).then(updated => {
        setVideos(vs => vs.map(v => v.id === videoId ? { ...v, saves: updated.saves } : v));
      }).catch(console.error);
      return next;
    });
  };

  const toggleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      const wasFollowing = next.has(userId);
      if (wasFollowing) {
        next.delete(userId);
        apiFetch('/api/follows', {
          method: 'DELETE',
          body: JSON.stringify({ followerId: currentUser?.id, followingId: userId }),
        }).catch(console.error);
        setProfiles(ps => ps.map(p =>
          p.user_id === userId ? { ...p, followers: Math.max(0, p.followers - 1) } : p
        ));
      } else {
        next.add(userId);
        apiFetch('/api/follows', {
          method: 'POST',
          body: JSON.stringify({
            followerId: currentUser?.id,
            followingId: userId,
            actorName: currentUser?.name,
            actorAvatar: currentUser?.avatar,
          }),
        }).catch(console.error);
        setProfiles(ps => ps.map(p =>
          p.user_id === userId ? { ...p, followers: p.followers + 1 } : p
        ));
      }
      return next;
    });
  };

  const addComment = async (videoId: string, userName: string, text: string, userId?: string) => {
    const data = await apiFetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({
        videoId,
        userName,
        text,
        userId: userId || currentUser?.id,
        userAvatar: currentUser?.avatar,
      }),
    });
    setVideos(vs => vs.map(v => v.id === videoId ? { ...v, comments: [...v.comments, data] } : v));
  };

  const addRequest = async (req: { fromUserId: string; fromUserName: string; toUserId: string; toUserName: string; videoId: string; videoTitle: string; type: string; description: string; priority: string; status: string }) => {
    const data = await apiFetch('/api/requests', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    setRequests(prev => [data, ...prev]);
  };

  const updateRequestStatus = async (reqId: string, status: string) => {
    await apiFetch(`/api/requests/${reqId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
  };

  const addRequestMessage = async (reqId: string, senderId: string, senderName: string, text: string) => {
    const data = await apiFetch(`/api/requests/${reqId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ senderId, senderName, text }),
    });
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, messages: [...r.messages, data] } : r));
  };

  const rateRequest = async (reqId: string, rating: number, feedback: string) => {
    await apiFetch(`/api/requests/${reqId}`, {
      method: 'PATCH',
      body: JSON.stringify({ rating, feedback, status: 'completed' }),
    });
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, rating, feedback, status: 'completed' } : r));
    apiFetch('/api/profiles').then(setProfiles).catch(() => {});
  };

  const updateVideoStatus = async (videoId: string, status: string) => {
    await apiFetch(`/api/videos/${videoId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status } : v));
    apiFetch('/api/profiles').then(setProfiles).catch(() => {});
  };

  const deleteVideo = async (videoId: string) => {
    await apiFetch(`/api/videos/${videoId}`, { method: 'DELETE' });
    setVideos(prev => prev.filter(v => v.id !== videoId));
  };

  const addVideo = async (video: { userId: string; userName: string; userAvatar: string; userDepartment: string; title: string; description: string; tags: string[]; category: string; videoUrl: string; thumbnailColor: string; status: string; isAdmin?: boolean }) => {
    const data = await apiFetch('/api/videos', {
      method: 'POST',
      body: JSON.stringify(video),
    });
    setVideos(prev => [data, ...prev]);
  };

  const addCategory = async (name: string, icon: string) => {
    const data = await apiFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name, icon }),
    });
    setCategories(prev => [...prev, data]);
  };

  const deleteCategory = async (id: string) => {
    await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const incrementView = (videoId: string) => {
    apiFetch(`/api/videos/${videoId}/view`, { method: 'POST' }).catch(console.error);
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, views: v.views + 1 } : v));
  };

  const updateProfile = async (userId: string, updates: { name?: string; department?: string; bio?: string; skills?: string[]; years_experience?: number; avatar?: string }) => {
    const data = await apiFetch(`/api/profiles/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    setProfiles(prev => prev.map(p => p.user_id === userId ? { ...p, ...data } : p));
  };

  const loadPointsHistory = async (userId: string) => {
    const data = await apiFetch(`/api/points/${userId}`);
    setPointsHistory(data);
  };

  const loadNotifications = async (userId: string) => {
    const data = await apiFetch(`/api/notifications/${userId}`);
    setNotificationsList(data);
  };

  const markNotificationRead = (id: string) => {
    apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(console.error);
    setNotificationsList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = (userId: string) => {
    apiFetch(`/api/notifications/read-all/${userId}`, { method: 'PATCH' }).catch(console.error);
    setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
  };

  const loadFollowers = async (userId: string) => {
    const data = await apiFetch(`/api/followers/${userId}`);
    setFollowersList(data);
  };

  return (
    <DataContext.Provider value={{
      videos, requests, categories, profiles,
      likedVideos, savedVideos, followedUsers, pointsHistory, notifications: notificationsList, settings, loading,
      toggleLike, toggleSave, toggleFollow,
      addComment, addRequest, updateRequestStatus, addRequestMessage, rateRequest,
      updateVideoStatus, deleteVideo, addVideo, addCategory, deleteCategory,
      incrementView, updateProfile,
      refreshData: fetchData,
      loadPointsHistory,
      loadNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      updateSettings,
      followersList,
      loadFollowers,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
