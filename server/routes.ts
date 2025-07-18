import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMeetingSchema, insertUserSchema, loginSchema, linkProcessSchema } from "@shared/schema";
import { analyzeMeetingTranscript } from "./services/textAnalyzer";
import { processLink, detectLinkType } from "./services/linkProcessor";
import { speechToTextService } from "./services/speechToText";
import { authenticateToken, hashPassword, comparePassword, generateToken, type AuthRequest } from "./auth";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for video/audio files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/plain', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/pdf',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/webm',
      'audio/mp3',
      'audio/wav',
      'audio/m4a',
      'audio/mpeg'
    ];
    const allowedExtensions = ['.txt', '.docx', '.pdf', '.mp4', '.avi', '.mov', '.wmv', '.webm', '.mp3', '.wav', '.m4a'];
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only text files (.txt, .docx, .pdf) and video/audio files (.mp4, .avi, .mov, .mp3, .wav, etc.) are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username) || 
                          await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username or email already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(user.id);

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Registration failed:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Find user by username or email
      const user = await storage.getUserByUsername(username) || 
                  await storage.getUserByEmail(username);
      
      if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken(user.id);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Login failed:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/auth/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const updates = req.body;
      
      // Remove sensitive fields
      delete updates.password;
      delete updates.id;
      
      const user = await storage.updateUser(req.userId!, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get AI provider status
  app.get("/api/ai-status", async (req, res) => {
    try {
      const { AIProviderManager } = await import('./services/aiProviders.js');
      const aiManager = new AIProviderManager();
      const provider = await aiManager.getAvailableProvider();
      
      res.json({
        currentProvider: provider.name,
        status: provider.name === 'Local' ? 'limited' : 'full',
        message: provider.name === 'Local' 
          ? 'Using local analysis - upgrade AI provider for detailed insights'
          : `Using ${provider.name} for AI-powered analysis`
      });
    } catch (error) {
      res.json({
        currentProvider: 'Local',
        status: 'limited',
        message: 'Using local analysis - AI providers unavailable'
      });
    }
  });

  // Get all meetings (protected)
  app.get("/api/meetings", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const meetings = await storage.getAllMeetings(req.userId!);
      console.log(`Fetching meetings for user ${req.userId}:`, {
        count: meetings.length,
        meetings: meetings.map(m => ({ id: m.id, filename: m.filename, status: m.processingStatus }))
      });
      res.json(meetings);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Get specific meeting (protected)
  app.get("/api/meetings/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meeting ID" });
      }

      const meeting = await storage.getMeeting(id, req.userId!);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      console.log(`Fetching meeting ${id}:`, {
        processingStatus: meeting.processingStatus,
        hasSummary: !!meeting.summary,
        summaryLength: meeting.summary?.length,
        keyPointsCount: meeting.keyPoints?.length,
        actionItemsCount: meeting.actionItems?.length
      });

      res.json(meeting);
    } catch (error) {
      console.error("Failed to fetch meeting:", error);
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  // Upload and analyze meeting transcript (protected)
  app.post("/api/meetings/upload", authenticateToken, upload.single('transcript'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Extract text content from file
      let content: string;
      
      // Check if it's a video/audio file that needs transcription
      if (speechToTextService.isAudioVideoFile(req.file.originalname)) {
        try {
          console.log(`Processing video/audio file: ${req.file.originalname}`);
          const transcriptionResult = await speechToTextService.transcribeAudio(req.file.buffer, req.file.originalname);
          content = transcriptionResult.text;
          
          if (!content.trim()) {
            return res.status(400).json({ message: "No speech detected in the audio/video file" });
          }
          
          console.log(`Transcription completed: ${content.length} characters`);
        } catch (error) {
          console.error('Transcription failed:', error);
          return res.status(400).json({ 
            message: `Failed to transcribe audio/video: ${error instanceof Error ? error.message : 'Unknown error'}` 
          });
        }
      } else {
        // Handle text files
        try {
          // Convert buffer to string and clean it
          content = req.file.buffer.toString('utf-8');
          
          // Remove null bytes and other problematic characters
          content = content.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
          
          // Ensure valid UTF-8 by re-encoding
          content = Buffer.from(content, 'utf-8').toString('utf-8');
          
        } catch (error) {
          return res.status(400).json({ message: "Failed to read file content. Please ensure the file is in UTF-8 format." });
        }

        if (!content.trim()) {
          return res.status(400).json({ message: "File appears to be empty or contains only invalid characters" });
        }
      }

      // Validate the meeting data
      const meetingData = {
        userId: req.userId!,
        filename: req.file.originalname,
        content: content.trim(),
        sourceType: "file" as const,
        sourceUrl: null,
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

  // Process meeting link (protected)
  app.post("/api/meetings/process-link", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { url } = linkProcessSchema.parse(req.body);
      
      // Auto-detect link type
      const detectedType = detectLinkType(url);
      if (detectedType === "unknown") {
        return res.status(400).json({ message: "Unsupported link type. Please use YouTube, Microsoft Teams, or Zoom links." });
      }

      // Process the link
      const linkResult = await processLink(url, detectedType);

      // Clean content to ensure valid UTF-8
      let cleanContent = linkResult.content;
      try {
        // Remove null bytes and other problematic characters
        cleanContent = cleanContent.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        // Ensure valid UTF-8 by re-encoding
        cleanContent = Buffer.from(cleanContent, 'utf-8').toString('utf-8');
      } catch (error) {
        console.error("Content cleaning failed:", error);
      }

      // Create meeting record
      const meetingData = {
        userId: req.userId!,
        filename: linkResult.title,
        content: cleanContent,
        sourceType: detectedType,
        sourceUrl: url,
      };

      const meeting = await storage.createMeeting(meetingData);

      // Start processing asynchronously
      processTranscriptAsync(meeting.id, linkResult.content);

      res.json({
        message: "Link processed successfully",
        meetingId: meeting.id,
        title: linkResult.title,
        duration: linkResult.duration,
        status: "processing"
      });

    } catch (error) {
      console.error("Link processing failed:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to process link" 
      });
    }
  });

  // Get processing status (protected)
  app.get("/api/meetings/:id/status", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meeting ID" });
      }

      const meeting = await storage.getMeeting(id, req.userId!);
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
    const updateData = {
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
    };
    
    console.log(`Updating meeting ${meetingId} with analysis:`, {
      summary: analysis.summary?.substring(0, 100),
      keyPointsCount: analysis.keyPoints?.length,
      decisionsCount: analysis.decisions?.length,
      actionItemsCount: analysis.actionItems?.length
    });
    
    await storage.updateMeeting(meetingId, updateData);

    console.log(`Meeting ${meetingId} processed successfully`);
  } catch (error) {
    console.error(`Failed to process meeting ${meetingId}:`, error);
    await storage.updateMeeting(meetingId, { 
      processingStatus: "failed" 
    });
  }
}
