import OpenAI from "openai";
import type { ActionItem, SentimentAnalysis, SpeakerAnalysis } from "@shared/schema";

// Text analysis service configuration
const textAnalyzer = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

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
    // Generate comprehensive analysis using advanced language model
    const analysisResponse = await textAnalyzer.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze the meeting transcript and provide comprehensive insights in JSON format. 

          Return a JSON object with these exact fields:
          - summary: A concise meeting summary (2-3 sentences)
          - keyPoints: Array of 3-5 key discussion points
          - decisions: Array of decisions made during the meeting
          - nextSteps: Array of topics for next meeting
          - actionItems: Array of objects with {id, task, assignee, priority, deadline, context, status}
          - duration: Estimated meeting duration in minutes
          - participantCount: Number of unique speakers/participants
          - overallSentiment: "positive", "neutral", or "negative"
          - sentimentTimeline: Array of {timeRange, sentiment} objects (sentiment 0-100)
          - topicSentiment: Array of {topic, timeRange, sentiment} objects
          - speakers: Array of {name, initials, speakingTime, contribution} objects
          - speakerInsights: String with insights about meeting balance and participation

          For action items, extract specific tasks with assignees. Priority should be "high", "medium", or "low".
          For sentiment, use 0-100 scale where 0 is very negative, 50 is neutral, 100 is very positive.
          Extract speaker names and estimate their participation.`
        },
        {
          role: "user",
          content: `Analyze this meeting transcript:\n\n${content}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(analysisResponse.choices[0].message.content || "{}");

    // Structure the action items
    const actionItems: ActionItem[] = (analysis.actionItems || []).map((item: any, index: number) => ({
      id: `action-${index + 1}`,
      task: item.task || "",
      assignee: item.assignee || "Unassigned",
      priority: item.priority || "medium",
      deadline: item.deadline || null,
      context: item.context || "",
      status: "pending"
    }));

    // Structure sentiment analysis
    const sentimentAnalysis: SentimentAnalysis = {
      overall: Math.max(0, Math.min(100, analysis.overallSentiment === "positive" ? 78 : 
                                           analysis.overallSentiment === "negative" ? 25 : 50)),
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
      insights: analysis.speakerInsights || "No speaker insights available."
    };

    return {
      summary: analysis.summary || "Meeting summary not available.",
      keyPoints: analysis.keyPoints || [],
      decisions: analysis.decisions || [],
      nextSteps: analysis.nextSteps || [],
      actionItems,
      sentimentAnalysis,
      speakerAnalysis,
      duration: analysis.duration || 45,
      participantCount: analysis.participantCount || speakerAnalysis.speakers.length,
      overallSentiment: analysis.overallSentiment || "neutral"
    };

  } catch (error) {
    console.error("Text analysis failed:", error);
    throw new Error(`Failed to analyze meeting transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
