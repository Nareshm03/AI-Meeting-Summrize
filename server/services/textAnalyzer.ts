import { AIProviderManager } from './aiProviders.js';
import type { ActionItem, SentimentAnalysis, SpeakerAnalysis } from "@shared/schema";

const aiManager = new AIProviderManager();

export async function analyzeMeetingTranscript(content: string): Promise<{
  summary: string;
  keyPoints: string[];
  decisions: string[];
  nextSteps: string[];
  actionItems: ActionItem[];
  sentimentAnalysis: SentimentAnalysis;
  speakerAnalysis: SpeakerAnalysis;
  duration: number;
  participantCount: number;
  overallSentiment: string;
}> {
  try {
    console.log('Starting meeting transcript analysis...');
    const analysis = await aiManager.analyzeContent(content);
    console.log('Analysis completed successfully');

    // Structure the action items
    const actionItems: ActionItem[] = (analysis.actionItems || []).map((item: any, index: number) => ({
      id: `action-${index + 1}`,
      task: typeof item === 'string' ? item : (item.task || item),
      assignee: typeof item === 'object' ? (item.assignee || "Unassigned") : "Unassigned",
      priority: typeof item === 'object' ? (item.priority || "medium") : "medium",
      deadline: typeof item === 'object' ? (item.deadline || null) : null,
      context: typeof item === 'object' ? (item.context || "") : "",
      status: "pending"
    }));

    // Structure sentiment analysis
    const sentimentAnalysis: SentimentAnalysis = {
      overall: typeof analysis.sentimentAnalysis === 'object' && analysis.sentimentAnalysis.overall 
        ? analysis.sentimentAnalysis.overall 
        : (analysis.overallSentiment === "positive" ? 78 : 
           analysis.overallSentiment === "negative" ? 25 : 50),
      timeline: analysis.sentimentTimeline || [],
      topicBreakdown: analysis.topicSentiment || []
    };

    // Structure speaker analysis
    const speakerAnalysis: SpeakerAnalysis = {
      speakers: (analysis.speakers || []).map((speaker: any) => ({
        name: speaker.name || "Unknown Speaker",
        initials: speaker.initials || speaker.name?.split(' ').map((n: string) => n[0]).join('') || "??",
        speakingTime: speaker.speakingTime || 0,
        contribution: speaker.contribution || ""
      })),
      insights: analysis.speakerInsights || analysis.speakerAnalysis || "Analysis completed with available provider."
    };

    return {
      summary: analysis.summary || "Meeting analysis completed.",
      keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
      decisions: Array.isArray(analysis.decisions) ? analysis.decisions : [],
      nextSteps: Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [],
      actionItems,
      sentimentAnalysis,
      speakerAnalysis,
      duration: analysis.duration || 45,
      participantCount: analysis.participantCount || Math.max(1, speakerAnalysis.speakers.length),
      overallSentiment: analysis.overallSentiment || "neutral"
    };

  } catch (error) {
    console.error("Text analysis failed:", error);
    throw new Error(`Failed to analyze meeting transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
