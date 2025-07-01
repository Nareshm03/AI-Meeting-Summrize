import ytdl from "ytdl-core";
import { YoutubeTranscript } from "youtube-transcript";

export interface LinkProcessResult {
  content: string;
  title: string;
  duration?: number;
  sourceType: "youtube" | "teams" | "zoom";
}

export async function processYouTubeLink(url: string): Promise<LinkProcessResult> {
  try {
    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      throw new Error("Invalid YouTube URL");
    }

    // Get video info
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const duration = parseInt(info.videoDetails.lengthSeconds);

    // Extract video ID from URL
    const videoId = ytdl.getVideoID(url);
    
    // Get transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    // Combine transcript text
    const content = transcript
      .map(item => item.text)
      .join(' ')
      .replace(/\[.*?\]/g, '') // Remove timestamp markers
      .trim();

    if (!content) {
      throw new Error("No transcript available for this video");
    }

    return {
      content,
      title,
      duration: Math.round(duration / 60), // Convert to minutes
      sourceType: "youtube"
    };
  } catch (error) {
    throw new Error(`Failed to process YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function processTeamsLink(url: string): Promise<LinkProcessResult> {
  // For Microsoft Teams, we'll provide a placeholder since direct processing requires special permissions
  // In production, this would integrate with Microsoft Graph API
  throw new Error("Microsoft Teams meeting processing requires additional authentication. Please download the transcript file and upload it directly.");
}

export async function processZoomLink(url: string): Promise<LinkProcessResult> {
  // For Zoom, we'll provide a placeholder since direct processing requires API access
  // In production, this would integrate with Zoom API
  throw new Error("Zoom meeting processing requires additional authentication. Please download the transcript file and upload it directly.");
}

export async function processLink(url: string, type: "youtube" | "teams" | "zoom"): Promise<LinkProcessResult> {
  switch (type) {
    case "youtube":
      return processYouTubeLink(url);
    case "teams":
      return processTeamsLink(url);
    case "zoom":
      return processZoomLink(url);
    default:
      throw new Error("Unsupported link type");
  }
}

export function detectLinkType(url: string): "youtube" | "teams" | "zoom" | "unknown" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }
  if (url.includes("teams.microsoft.com")) {
    return "teams";
  }
  if (url.includes("zoom.us")) {
    return "zoom";
  }
  return "unknown";
}