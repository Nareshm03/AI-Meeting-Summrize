# Intelligent Meeting Summarizer

## Overview

The Intelligent Meeting Summarizer is an AI-powered web application that processes meeting transcripts and provides comprehensive analysis including sentiment analysis, action item extraction, and speaker insights. Built with a modern full-stack architecture using React, Express, Drizzle ORM, and OpenAI's GPT-4o model.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for sentiment timeline visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with file upload support via Multer
- **Development**: Hot module replacement via Vite middleware integration

### Data Storage Strategy
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL (using @neondatabase/serverless for cloud deployment)
- **Migrations**: Drizzle Kit for schema management
- **Development Storage**: In-memory storage implementation for rapid development
- **Session Management**: Connect-pg-simple for PostgreSQL session store

## Key Components

### Meeting Processing Pipeline
1. **File Upload**: Supports .txt, .docx, and .pdf transcripts (10MB limit)
2. **AI Analysis**: OpenAI GPT-4o integration for comprehensive transcript analysis
3. **Data Extraction**: Automated extraction of summaries, action items, sentiment, and speaker insights
4. **Real-time Updates**: Polling mechanism for processing status updates

### Core Data Models
- **Users**: Basic user authentication and management
- **Meetings**: Comprehensive meeting records with analysis results
- **Action Items**: Structured task tracking with priority and assignment
- **Sentiment Analysis**: Timeline-based sentiment tracking with topic breakdown
- **Speaker Analysis**: Participation metrics and contribution insights

### UI Components
- **File Upload**: Drag-and-drop interface with progress tracking
- **Meeting Analysis**: Tabbed interface displaying all analysis results
- **Sentiment Visualization**: Interactive charts showing sentiment over time
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Data Flow

1. **Upload Flow**: User uploads transcript → Server validates and stores → AI processing begins
2. **Analysis Flow**: OpenAI processes transcript → Extracts structured data → Updates database
3. **Display Flow**: Frontend polls for updates → Renders analysis results → Provides export options
4. **Real-time Updates**: WebSocket-like polling for processing status updates

## External Dependencies

### AI Services
- **OpenAI GPT-4o**: Primary AI model for transcript analysis and insight generation
- **API Configuration**: Environment-based API key management

### Database Services
- **Neon Database**: Serverless PostgreSQL for production deployment
- **Connection Pooling**: Built-in connection management via @neondatabase/serverless

### UI Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Modern icon library for consistent iconography
- **Recharts**: Declarative chart library for data visualization

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement and fast development builds
- **Express Middleware**: Integrated development server setup
- **Environment Variables**: DATABASE_URL and OPENAI_API_KEY configuration

### Production Build
- **Frontend**: Vite production build with optimized bundles
- **Backend**: ESBuild bundling for Node.js deployment
- **Static Assets**: Served from Express with proper caching headers

### Database Migration
- **Schema Management**: Drizzle Kit for version-controlled migrations
- **Environment Separation**: Separate databases for development and production

## Changelog

Changelog:
- July 01, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.