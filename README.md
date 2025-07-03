<<<<<<< HEAD
# Meeting Summarizer

A comprehensive web application for analyzing and summarizing meeting transcripts with advanced features including sentiment analysis, action item extraction, and speaker insights.

## Features

- **Meeting Analysis**: Upload and analyze meeting transcripts in various formats (.txt, .docx, .pdf,.mp3,mp4)
- **Smart Summarization**: Generate concise summaries with key points and decisions
- **Action Item Extraction**: Automatically identify and track action items with priorities
- **Sentiment Analysis**: Analyze meeting sentiment over time with interactive visualizations
- **Speaker Insights**: Track speaker participation and contribution analysis
- **Export Options**: Export analysis results in multiple formats
- **Responsive Design**: Modern, mobile-friendly interface

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** components built on Radix UI
- **TanStack Query** for state management
- **Recharts** for data visualization
- **Wouter** for routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Drizzle ORM** with PostgreSQL
- **OpenAI API** for text analysis
- **Multer** for file uploads
- **JWT** for authentication

### Database
- **PostgreSQL** with Neon serverless
- **Drizzle Kit** for migrations
- **Session management** with connect-pg-simple

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <https://github.com/Nareshm03/AI-Meeting-Summrize>
cd meeting-summarizer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env
```

Edit `.env` with your configuration:
```
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
SESSION_SECRET=your_session_secret
```

4. Set up the database:
```bash
# Generate and run database migrations
npm run db:generate
npm run db:push

# Or for production deployment
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push database schema changes
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express application
│   ├── services/          # Business logic services
│   ├── routes.ts          # API routes
│   ├── db.ts             # Database configuration
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
└── dist/                # Production build output
```

## API Endpoints

- `POST /api/meetings` - Create new meeting analysis
- `GET /api/meetings` - Get user's meetings
- `GET /api/meetings/:id` - Get specific meeting
- `DELETE /api/meetings/:id` - Delete meeting
- `POST /api/upload` - Upload meeting transcript
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## About

This project was developed to solve the common problem of extracting actionable insights from lengthy meeting transcripts. The application combines modern web technologies with advanced text processing to deliver a comprehensive meeting analysis solution.

## Features Highlights

- **Smart Text Processing**: Advanced algorithms for extracting meaningful insights
- **Real-time Analysis**: Fast processing with immediate results
- **User-Friendly Interface**: Clean, intuitive design for seamless user experience
- **Secure & Scalable**: Built with security and performance in mind
=======
# AI-Meeting-Summrize
>>>>>>> 3af936844cc30d3cc7358b6a8935018c55c28735
