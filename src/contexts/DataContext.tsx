import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// Re-export types that match the DB shape for consumers
export type Video = Tables<'videos'> & { comments: Comment[] };
export type Comment = Tables<'comments'>;
export type ServiceRequest = Tables<'service_requests'> & { messages: RequestMessage[] };
export type RequestMessage = Tables<'request_messages'>;
export type UserProfile = Tables<'profiles'>;
export type Category = Tables<'categories'>;

interface DataContextType {
  videos: Video[];
  requests: ServiceRequest[];
  categories: Category[];
  profiles: UserProfile[];
  likedVideos: Set<string>;
  savedVideos: Set<string>;
  followedUsers: Set<string>;
  loading: boolean;
  toggleLike: (videoId: string) => void;
  toggleSave: (videoId: string) => void;
  toggleFollow: (userId: string) => void;
  addComment: (videoId: string, userName: string, text: string) => void;
  addRequest: (req: { fromUserId: string; fromUserName: string; toUserId: string; toUserName: string; videoId: string; videoTitle: string; type: string; description: string; priority: string; status: string }) => void;
  updateRequestStatus: (reqId: string, status: string) => void;
  addRequestMessage: (reqId: string, senderId: string, senderName: string, text: string) => void;
  rateRequest: (reqId: string, rating: number, feedback: string) => void;
  updateVideoStatus: (videoId: string, status: string) => void;
  deleteVideo: (videoId: string) => void;
  addVideo: (video: { userId: string; userName: string; userAvatar: string; userDepartment: string; title: string; description: string; tags: string[]; category: string; videoUrl: string; thumbnailColor: string; status: string }) => void;
  addCategory: (name: string, icon: string) => void;
  deleteCategory: (id: string) => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [videosRes, commentsRes, requestsRes, messagesRes, categoriesRes, profilesRes] = await Promise.all([
        supabase.from('videos').select('*').order('created_at', { ascending: false }),
        supabase.from('comments').select('*').order('created_at', { ascending: true }),
        supabase.from('service_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('request_messages').select('*').order('created_at', { ascending: true }),
        supabase.from('categories').select('*'),
        supabase.from('profiles').select('*'),
      ]);

      // Merge comments into videos
      const commentsByVideo = new Map<string, Comment[]>();
      (commentsRes.data || []).forEach(c => {
        if (!commentsByVideo.has(c.video_id)) commentsByVideo.set(c.video_id, []);
        commentsByVideo.get(c.video_id)!.push(c);
      });
      const videosWithComments: Video[] = (videosRes.data || []).map(v => ({
        ...v,
        comments: commentsByVideo.get(v.id) || [],
      }));

      // Merge messages into requests
      const messagesByRequest = new Map<string, RequestMessage[]>();
      (messagesRes.data || []).forEach(m => {
        if (!messagesByRequest.has(m.request_id)) messagesByRequest.set(m.request_id, []);
        messagesByRequest.get(m.request_id)!.push(m);
      });
      const requestsWithMessages: ServiceRequest[] = (requestsRes.data || []).map(r => ({
        ...r,
        messages: messagesByRequest.get(r.id) || [],
      }));

      setVideos(videosWithComments);
      setRequests(requestsWithMessages);
      setCategories(categoriesRes.data || []);
      setProfiles(profilesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleLike = (videoId: string) => {
    setLikedVideos(prev => {
      const next = new Set(prev);
      const liked = next.has(videoId);
      if (liked) next.delete(videoId); else next.add(videoId);
      // Update in DB
      const video = videos.find(v => v.id === videoId);
      if (video) {
        supabase.from('videos').update({ likes: video.likes + (liked ? -1 : 1) }).eq('id', videoId).then();
      }
      setVideos(vs => vs.map(v => v.id === videoId ? { ...v, likes: v.likes + (liked ? -1 : 1) } : v));
      return next;
    });
  };

  const toggleSave = (videoId: string) => {
    setSavedVideos(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId); else next.add(videoId);
      return next;
    });
  };

  const toggleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId); else next.add(userId);
      return next;
    });
  };

  const addComment = async (videoId: string, userName: string, text: string) => {
    const { data } = await supabase.from('comments').insert({ video_id: videoId, user_name: userName, text }).select().single();
    if (data) {
      setVideos(vs => vs.map(v => v.id === videoId ? { ...v, comments: [...v.comments, data] } : v));
    }
  };

  const addRequest = async (req: { fromUserId: string; fromUserName: string; toUserId: string; toUserName: string; videoId: string; videoTitle: string; type: string; description: string; priority: string; status: string }) => {
    const { data } = await supabase.from('service_requests').insert({
      from_user_id: req.fromUserId,
      from_user_name: req.fromUserName,
      to_user_id: req.toUserId,
      to_user_name: req.toUserName,
      video_id: req.videoId,
      video_title: req.videoTitle,
      type: req.type,
      description: req.description,
      priority: req.priority,
      status: req.status,
    }).select().single();
    if (data) {
      setRequests(prev => [{ ...data, messages: [] }, ...prev]);
    }
  };

  const updateRequestStatus = async (reqId: string, status: string) => {
    await supabase.from('service_requests').update({ status }).eq('id', reqId);
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
  };

  const addRequestMessage = async (reqId: string, senderId: string, senderName: string, text: string) => {
    const { data } = await supabase.from('request_messages').insert({
      request_id: reqId,
      sender_id: senderId,
      sender_name: senderName,
      text,
    }).select().single();
    if (data) {
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, messages: [...r.messages, data] } : r));
    }
  };

  const rateRequest = async (reqId: string, rating: number, feedback: string) => {
    await supabase.from('service_requests').update({ rating, feedback, status: 'completed' }).eq('id', reqId);
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, rating, feedback, status: 'completed' } : r));
  };

  const updateVideoStatus = async (videoId: string, status: string) => {
    await supabase.from('videos').update({ status }).eq('id', videoId);
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status } : v));
  };

  const deleteVideo = async (videoId: string) => {
    await supabase.from('videos').delete().eq('id', videoId);
    setVideos(prev => prev.filter(v => v.id !== videoId));
  };

  const addVideo = async (video: { userId: string; userName: string; userAvatar: string; userDepartment: string; title: string; description: string; tags: string[]; category: string; videoUrl: string; thumbnailColor: string; status: string }) => {
    const { data } = await supabase.from('videos').insert({
      user_id: video.userId,
      user_name: video.userName,
      user_avatar: video.userAvatar,
      user_department: video.userDepartment,
      title: video.title,
      description: video.description,
      tags: video.tags,
      category: video.category,
      video_url: video.videoUrl,
      thumbnail_color: video.thumbnailColor,
      status: video.status,
    }).select().single();
    if (data) {
      setVideos(prev => [{ ...data, comments: [] }, ...prev]);
    }
  };

  const addCategory = async (name: string, icon: string) => {
    const { data } = await supabase.from('categories').insert({ name, icon }).select().single();
    if (data) {
      setCategories(prev => [...prev, data]);
    }
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <DataContext.Provider value={{
      videos, requests, categories, profiles,
      likedVideos, savedVideos, followedUsers, loading,
      toggleLike, toggleSave, toggleFollow,
      addComment, addRequest, updateRequestStatus, addRequestMessage, rateRequest,
      updateVideoStatus, deleteVideo, addVideo, addCategory, deleteCategory,
      refreshData: fetchData,
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
