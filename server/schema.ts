import { pgTable, uuid, text, integer, numeric, timestamp, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  user_id: text('user_id').notNull(),
  actor_name: text('actor_name').notNull(),
  actor_avatar: text('actor_avatar').notNull().default(''),
  type: text('type').notNull(),
  video_title: text('video_title').notNull().default(''),
  video_id: text('video_id').notNull().default(''),
  read: boolean('read').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull().unique(),
  icon: text('icon').notNull().default('📁'),
  count: integer('count').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  user_id: text('user_id').notNull().unique(),
  name: text('name').notNull(),
  department: text('department').notNull().default(''),
  bio: text('bio').notNull().default(''),
  skills: text('skills').array().notNull().default(sql`'{}'`),
  years_experience: integer('years_experience').notNull().default(0),
  avatar: text('avatar').notNull().default(''),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('0'),
  total_ratings: integer('total_ratings').notNull().default(0),
  followers: integer('followers').notNull().default(0),
  following: integer('following').notNull().default(0),
  videos_count: integer('videos_count').notNull().default(0),
  points: integer('points').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const user_follows = pgTable('user_follows', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  follower_id: text('follower_id').notNull(),
  following_id: text('following_id').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const points_history = pgTable('points_history', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  user_id: text('user_id').notNull(),
  action: text('action').notNull(),
  points: integer('points').notNull(),
  description: text('description').notNull().default(''),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  user_id: text('user_id').notNull(),
  user_name: text('user_name').notNull(),
  user_avatar: text('user_avatar').notNull().default(''),
  user_department: text('user_department').notNull().default(''),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  tags: text('tags').array().notNull().default(sql`'{}'`),
  category: text('category').notNull().default('Uncategorized'),
  video_url: text('video_url').notNull().default(''),
  thumbnail_color: text('thumbnail_color').notNull().default('from-primary/80 to-accent/80'),
  likes: integer('likes').notNull().default(0),
  saves: integer('saves').notNull().default(0),
  views: integer('views').notNull().default(0),
  status: text('status').notNull().default('pending'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  video_id: uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().default(''),
  user_name: text('user_name').notNull(),
  text: text('text').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const service_requests = pgTable('service_requests', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  from_user_id: text('from_user_id').notNull(),
  from_user_name: text('from_user_name').notNull(),
  to_user_id: text('to_user_id').notNull(),
  to_user_name: text('to_user_name').notNull(),
  video_id: text('video_id').notNull(),
  video_title: text('video_title').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull().default(''),
  priority: text('priority').notNull().default('medium'),
  status: text('status').notNull().default('pending'),
  rating: integer('rating'),
  feedback: text('feedback'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const request_messages = pgTable('request_messages', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  request_id: uuid('request_id').notNull().references(() => service_requests.id, { onDelete: 'cascade' }),
  sender_id: text('sender_id').notNull(),
  sender_name: text('sender_name').notNull(),
  text: text('text').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
