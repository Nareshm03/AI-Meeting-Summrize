import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMeetingSchema } from "@shared/schema";
import { analyzeMeetingTranscript } from "./services/openai";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .txt, .docx, and .pdf files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all meetings
  app.get("/api/meetings", async (req, res) => {
    try {
      const meetings = await storage.getAllMeetings();
      res.json(meetings);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Get specific meeting
  app.get("/api/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meeting ID" });
      }

      const meeting = await storage.getMeeting(id);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      res.json(meeting);
    } catch (error) {
      console.error("Failed to fetch meeting:", error);
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  // Upload and analyze meeting transcript
  app.post("/api/meetings/upload", upload.single('transcript'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Extract text content from file
      let content: string;
      try {
        content = req.file.buffer.toString('utf-8');
      } catch (error) {
        return res.status(400).json({ message: "Failed to read file content. Please ensure the file is in UTF-8 format." });
      }

      if (!content.trim()) {
        return res.status(400).json({ message: "File appears to be empty" });
      }

      // Validate the meeting data
      const meetingData = {
        filename: req.file.originalname,
        content: content.trim()
      };

      const validatedData = insertMeetingSchema.parse(meetingData);

      // Create meeting record
      const meeting = await storage.createMeeting(validatedData);

      // Start processing asynchronously
      processTranscriptAsync(meeting.id, content);

      res.json({ 
        message: "File uploaded successfully", 
        meetingId: meeting.id,
        status: "processing"
      });

    } catch (error) {
      console.error("Upload failed:", error);
      if (error instanceof Error && error.message.includes('Invalid file type')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to upload file" });
      }
    }
  });

  // Get processing status
  app.get("/api/meetings/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meeting ID" });
      }

      const meeting = await storage.getMeeting(id);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      res.json({ 
        status: meeting.processingStatus,
        meetingId: id
      });
    } catch (error) {
      console.error("Failed to get status:", error);
      res.status(500).json({ message: "Failed to get processing status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Async function to process transcript
async function processTranscriptAsync(meetingId: number, content: string) {
  try {
    // Update status to processing
    await storage.updateMeeting(meetingId, { processingStatus: "processing" });

    // Analyze the transcript
    const analysis = await analyzeMeetingTranscript(content);

    // Update meeting with analysis results
    await storage.updateMeeting(meetingId, {
      processingStatus: "completed",
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      decisions: analysis.decisions,
      nextSteps: analysis.nextSteps,
      actionItems: analysis.actionItems,
      sentimentAnalysis: analysis.sentimentAnalysis,
      speakerAnalysis: analysis.speakerAnalysis,
      duration: analysis.duration,
      participantCount: analysis.participantCount,
      overallSentiment: analysis.overallSentiment
    });

    console.log(`Meeting ${meetingId} processed successfully`);
  } catch (error) {
    console.error(`Failed to process meeting ${meetingId}:`, error);
    await storage.updateMeeting(meetingId, { 
      processingStatus: "failed" 
    });
  }
}
