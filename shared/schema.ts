import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
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
  filename: true,
  content: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
