import { users, meetings, type User, type InsertUser, type Meeting, type InsertMeeting } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  getMeeting(id: number): Promise<Meeting | undefined>;
  updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting | undefined>;
  getAllMeetings(): Promise<Meeting[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meetings: Map<number, Meeting>;
  private currentUserId: number;
  private currentMeetingId: number;

  constructor() {
    this.users = new Map();
    this.meetings = new Map();
    this.currentUserId = 1;
    this.currentMeetingId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.currentMeetingId++;
    const meeting: Meeting = {
      ...insertMeeting,
      id,
      processingStatus: "pending",
      createdAt: new Date(),
      summary: null,
      keyPoints: null,
      decisions: null,
      nextSteps: null,
      actionItems: null,
      sentimentAnalysis: null,
      speakerAnalysis: null,
      duration: null,
      participantCount: null,
      overallSentiment: null,
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;
    
    const updatedMeeting = { ...meeting, ...updates };
    this.meetings.set(id, updatedMeeting);
    return updatedMeeting;
  }

  async getAllMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const storage = new MemStorage();
