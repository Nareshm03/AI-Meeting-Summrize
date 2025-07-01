import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  sourceType: text("source_type").notNull().default("file"), // file, youtube, teams, zoom
  sourceUrl: text("source_url"), // URL for links
  processingStatus: text("processing_status").notNull().default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Analysis results
  summary: text("summary"),
  keyPoints: jsonb("key_points").$type<string[]>(),
  decisions: jsonb("decisions").$type<string[]>(),
  nextSteps: jsonb("next_steps").$type<string[]>(),
  actionItems: jsonb("action_items").$type<ActionItem[]>(),
  sentimentAnalysis: jsonb("sentiment_analysis").$type<SentimentAnalysis>(),
  speakerAnalysis: jsonb("speaker_analysis").$type<SpeakerAnalysis>(),
  
  // Meeting metadata
  duration: integer("duration"), // in minutes
  participantCount: integer("participant_count"),
  overallSentiment: text("overall_sentiment"), // positive, neutral, negative
});

// Type definitions for complex JSON structures
export interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  context: string;
  status: 'pending' | 'completed';
}

export interface SentimentAnalysis {
  overall: number; // 0-100
  timeline: Array<{
    timeRange: string;
    sentiment: number;
  }>;
  topicBreakdown: Array<{
    topic: string;
    timeRange: string;
    sentiment: number;
  }>;
}

export interface SpeakerAnalysis {
  speakers: Array<{
    name: string;
    initials: string;
    speakingTime: number; // in minutes
    contribution: string;
  }>;
  insights: string;
}

export const insertMeetingSchema = createInsertSchema(meetings).pick({
  userId: true,
  filename: true,
  content: true,
  sourceType: true,
  sourceUrl: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const linkProcessSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  type: z.enum(["youtube", "teams", "zoom"], {
    errorMap: () => ({ message: "Unsupported link type" })
  }),
});

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
