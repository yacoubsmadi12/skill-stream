import React, { createContext, useContext, useState } from 'react';
import { Video, ServiceRequest, MOCK_VIDEOS, MOCK_REQUESTS, CATEGORIES, Category, MOCK_PROFILES, UserProfile } from '@/lib/mock-data';

interface DataContextType {
  videos: Video[];
  requests: ServiceRequest[];
  categories: Category[];
  profiles: UserProfile[];
  likedVideos: Set<string>;
  savedVideos: Set<string>;
  followedUsers: Set<string>;
  toggleLike: (videoId: string) => void;
  toggleSave: (videoId: string) => void;
  toggleFollow: (userId: string) => void;
  addComment: (videoId: string, userName: string, text: string) => void;
  addRequest: (req: Omit<ServiceRequest, 'id' | 'messages' | 'createdAt'>) => void;
  updateRequestStatus: (reqId: string, status: ServiceRequest['status']) => void;
  addRequestMessage: (reqId: string, senderId: string, senderName: string, text: string) => void;
  rateRequest: (reqId: string, rating: number, feedback: string) => void;
  updateVideoStatus: (videoId: string, status: Video['status']) => void;
  deleteVideo: (videoId: string) => void;
  addVideo: (video: Omit<Video, 'id' | 'likes' | 'comments' | 'saves' | 'views' | 'createdAt'>) => void;
  addCategory: (name: string, icon: string) => void;
  deleteCategory: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [requests, setRequests] = useState<ServiceRequest[]>(MOCK_REQUESTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [profiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const toggleLike = (videoId: string) => {
    setLikedVideos(prev => {
      const next = new Set(prev);
      const liked = next.has(videoId);
      if (liked) next.delete(videoId); else next.add(videoId);
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

  const addComment = (videoId: string, userName: string, text: string) => {
    setVideos(vs => vs.map(v => v.id === videoId ? {
      ...v,
      comments: [...v.comments, { id: `c${Date.now()}`, userId: '', userName, text, createdAt: new Date().toISOString() }],
    } : v));
  };

  const addRequest = (req: Omit<ServiceRequest, 'id' | 'messages' | 'createdAt'>) => {
    setRequests(prev => [...prev, { ...req, id: `r${Date.now()}`, messages: [], createdAt: new Date().toISOString() }]);
  };

  const updateRequestStatus = (reqId: string, status: ServiceRequest['status']) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
  };

  const addRequestMessage = (reqId: string, senderId: string, senderName: string, text: string) => {
    setRequests(prev => prev.map(r => r.id === reqId ? {
      ...r,
      messages: [...r.messages, { id: `m${Date.now()}`, senderId, senderName, text, createdAt: new Date().toISOString() }],
    } : r));
  };

  const rateRequest = (reqId: string, rating: number, feedback: string) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, rating, feedback, status: 'completed' as const } : r));
  };

  const updateVideoStatus = (videoId: string, status: Video['status']) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, status } : v));
  };

  const deleteVideo = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
  };

  const addVideo = (video: Omit<Video, 'id' | 'likes' | 'comments' | 'saves' | 'views' | 'createdAt'>) => {
    setVideos(prev => [...prev, {
      ...video,
      id: `v${Date.now()}`,
      likes: 0,
      comments: [],
      saves: 0,
      views: 0,
      createdAt: new Date().toISOString(),
    }]);
  };

  const addCategory = (name: string, icon: string) => {
    setCategories(prev => [...prev, { id: `cat${Date.now()}`, name, icon, count: 0 }]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <DataContext.Provider value={{
      videos, requests, categories, profiles,
      likedVideos, savedVideos, followedUsers,
      toggleLike, toggleSave, toggleFollow,
      addComment, addRequest, updateRequestStatus, addRequestMessage, rateRequest,
      updateVideoStatus, deleteVideo, addVideo, addCategory, deleteCategory,
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
