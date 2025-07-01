# Database Implementation & Setup Guide

## How the Database Works

Your Meeting Summarizer application uses a modern, professional database stack:

### Database Architecture

**PostgreSQL + Drizzle ORM + Neon Serverless**
- **PostgreSQL**: Robust relational database for data integrity
- **Drizzle ORM**: Type-safe database operations with excellent TypeScript support
- **Neon**: Serverless PostgreSQL for scalable cloud deployment

### Database Flow

1. **Schema Definition** (`shared/schema.ts`)
   - Defines table structures using Drizzle's schema builder
   - Type-safe column definitions with validation
   - Automatic TypeScript type generation

2. **Database Connection** (`server/db.ts`)
   - Establishes connection pool to PostgreSQL
   - Configures Drizzle with schema for type safety
   - Uses WebSocket for Neon serverless compatibility

3. **Data Access Layer** (`server/storage.ts`)
   - Clean abstraction over database operations
   - Implements repository pattern with `IStorage` interface
   - Type-safe CRUD operations for users and meetings

## Database Schema

### Users Table
```typescript
users {
  id: serial (Primary Key)
  username: text (Unique)
  email: text (Unique) 
  password: text (Hashed)
  firstName: text
  lastName: text
  profileImageUrl: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Meetings Table
```typescript
meetings {
  id: serial (Primary Key)
  userId: integer (Foreign Key → users.id)
  filename: text
  content: text (Meeting transcript)
  sourceType: text (file, youtube, teams, zoom)
  sourceUrl: text
  processingStatus: text (pending, processing, completed, failed)
  createdAt: timestamp
  
  // Analysis Results (JSON columns)
  summary: text
  keyPoints: jsonb<string[]>
  decisions: jsonb<string[]>
  nextSteps: jsonb<string[]>
  actionItems: jsonb<ActionItem[]>
  sentimentAnalysis: jsonb<SentimentAnalysis>
  speakerAnalysis: jsonb<SpeakerAnalysis>
  
  // Meeting Metadata
  duration: integer (minutes)
  participantCount: integer
  overallSentiment: text
}
```

### Complex Data Types

**ActionItem Interface:**
```typescript
{
  id: string
  task: string
  assignee: string
  priority: 'high' | 'medium' | 'low'
  deadline?: string
  context: string
  status: 'pending' | 'completed'
}
```

**SentimentAnalysis Interface:**
```typescript
{
  overall: number (0-100)
  timeline: Array<{
    timeRange: string
    sentiment: number
  }>
  topicBreakdown: Array<{
    topic: string
    timeRange: string
    sentiment: number
  }>
}
```

**SpeakerAnalysis Interface:**
```typescript
{
  speakers: Array<{
    name: string
    initials: string
    speakingTime: number
    contribution: string
  }>
  insights: string
}
```

## Database Operations

### How Data Flows

1. **User Registration/Login**
   ```typescript
   // Create user with hashed password
   const user = await storage.createUser({
     username, email, password: hashedPassword
   });
   ```

2. **Meeting Upload & Processing**
   ```typescript
   // Store meeting transcript
   const meeting = await storage.createMeeting({
     userId, filename, content, sourceType
   });
   
   // Process with text analyzer
   const analysis = await analyzeMeetingTranscript(content);
   
   // Update with analysis results
   await storage.updateMeeting(meeting.id, {
     summary: analysis.summary,
     keyPoints: analysis.keyPoints,
     actionItems: analysis.actionItems,
     // ... other analysis data
   });
   ```

3. **Data Retrieval**
   ```typescript
   // Get user's meetings
   const meetings = await storage.getAllMeetings(userId);
   
   // Get specific meeting
   const meeting = await storage.getMeeting(meetingId, userId);
   ```

## Database Setup Options

### Option 1: Neon (Recommended - Production Ready)
```bash
# 1. Sign up at neon.tech
# 2. Create new project
# 3. Copy connection string
# 4. Add to .env:
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

### Option 2: Local PostgreSQL
```bash
# Install PostgreSQL
# Create database
createdb meeting_summarizer

# Add to .env:
DATABASE_URL=postgresql://username:password@localhost:5432/meeting_summarizer
```

### Option 3: Docker PostgreSQL
```bash
docker run --name postgres-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=meeting_summarizer \
  -p 5432:5432 -d postgres:15

# Add to .env:
DATABASE_URL=postgresql://postgres:password@localhost:5432/meeting_summarizer
```

## Database Commands

```bash
# Generate migration files from schema changes
npm run db:generate

# Push schema directly to database (development)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Open database GUI
npm run db:studio
```

## Key Features

### Type Safety
- Full TypeScript integration
- Compile-time query validation
- Auto-generated types from schema

### Performance
- Connection pooling with Neon
- Efficient JSON storage for complex data
- Indexed queries for fast retrieval

### Scalability
- Serverless PostgreSQL with Neon
- Automatic scaling based on usage
- Built-in connection management

### Security
- Parameterized queries prevent SQL injection
- User-scoped data access
- Secure password hashing

## Environment Configuration

Required environment variables:
```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_secure_session_secret
PORT=5000
NODE_ENV=development
```

## Troubleshooting

### Common Issues
1. **Connection Errors**: Check DATABASE_URL format
2. **Migration Issues**: Ensure database is accessible
3. **Type Errors**: Run `npm run db:generate` after schema changes

### Performance Tips
- Use `npm run db:studio` to inspect data
- Monitor query performance in production
- Consider adding indexes for large datasets

This database implementation provides a solid foundation for your meeting analysis platform with room for future enhancements!