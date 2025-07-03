// Multiple AI Provider Support
import OpenAI from 'openai';

export interface AIProvider {
  name: string;
  analyze(content: string): Promise<any>;
  isAvailable(): Promise<boolean>;
}

// OpenAI Provider
class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async isAvailable(): Promise<boolean> {
    // Don't test availability with actual API call to avoid quota usage
    // Just check if API key exists
    const hasKey = !!process.env.OPENAI_API_KEY;
    if (!hasKey) {
      console.log('OpenAI API key not configured');
    }
    return hasKey;
  }

  async analyze(content: string) {
    const response = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert meeting analyst. Analyze the following meeting transcript and provide a comprehensive summary in JSON format with these fields:
          - summary: A concise overview of the meeting
          - keyPoints: Array of main discussion points
          - decisions: Array of decisions made
          - nextSteps: Array of action items and next steps
          - actionItems: Array of specific tasks assigned
          - sentimentAnalysis: Overall sentiment and tone
          - speakerAnalysis: Analysis of different speakers if identifiable
          - duration: Estimated meeting duration in minutes
          - participantCount: Estimated number of participants
          - overallSentiment: positive/neutral/negative`
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }
}

// Groq Provider (Free Alternative)
class GroqProvider implements AIProvider {
  name = 'Groq';

  async isAvailable(): Promise<boolean> {
    const hasKey = !!process.env.GROQ_API_KEY;
    if (hasKey) {
      console.log('Groq API key found - Groq provider available');
    } else {
      console.log('Groq API key not configured');
    }
    return hasKey;
  }

  async analyze(content: string) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq API key not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an expert meeting analyst. Analyze the meeting transcript and return ONLY a valid JSON object with these exact fields:

{
  "summary": "Brief meeting overview",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "decisions": ["decision 1", "decision 2"],
  "nextSteps": ["step 1", "step 2"],
  "actionItems": ["task 1", "task 2"],
  "sentimentAnalysis": {"overall": 75, "positive": 5, "negative": 1},
  "speakerAnalysis": "Brief analysis of speakers",
  "duration": 30,
  "participantCount": 3,
  "overallSentiment": "positive"
}

Return ONLY the JSON object, no other text.`
          },
          {
            role: 'user',
            content: `Analyze this meeting transcript:\n\n${content}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const responseContent = data.choices?.[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No content received from Groq API');
    }
    
    try {
      // First try parsing as-is
      return JSON.parse(responseContent);
    } catch (firstError) {
      console.log('First JSON parse failed, trying cleanup...');
      
      try {
        // Clean the response content to fix common JSON issues
        let cleanedContent = responseContent.trim();
        
        // Remove any text before the first {
        const firstBrace = cleanedContent.indexOf('{');
        if (firstBrace > 0) {
          cleanedContent = cleanedContent.substring(firstBrace);
        }
        
        // Remove any text after the last }
        const lastBrace = cleanedContent.lastIndexOf('}');
        if (lastBrace > 0) {
          cleanedContent = cleanedContent.substring(0, lastBrace + 1);
        }
        
        // Fix common JSON issues
        cleanedContent = cleanedContent
          .replace(/,\s*}/g, '}')  // Remove trailing commas before }
          .replace(/,\s*]/g, ']'); // Remove trailing commas before ]
        
        return JSON.parse(cleanedContent);
      } catch (secondError) {
        console.error('Failed to parse Groq response as JSON:', secondError);
        console.error('Raw response:', responseContent);
        
        // Try to extract data manually if JSON parsing fails
        try {
          // Extract summary
          const summaryMatch = responseContent.match(/"summary":\s*"([^"]+)"/);
          const summary = summaryMatch ? summaryMatch[1] : 'Meeting analysis completed';
          
          // Extract key points
          const keyPointsMatch = responseContent.match(/"keyPoints":\s*\[(.*?)\]/);
          const keyPoints = keyPointsMatch ? 
            keyPointsMatch[1].split(',').map((s: string) => s.replace(/"/g, '').trim()).filter((s: string) => s) :
            ['Analysis completed with available data'];
          
          // Extract decisions
          const decisionsMatch = responseContent.match(/"decisions":\s*\[(.*?)\]/);
          const decisions = decisionsMatch ? 
            decisionsMatch[1].split(',').map((s: string) => s.replace(/"/g, '').trim()).filter((s: string) => s) :
            [];
          
          // Extract action items
          const actionItemsMatch = responseContent.match(/"actionItems":\s*\[(.*?)\]/);
          const actionItems = actionItemsMatch ? 
            actionItemsMatch[1].split(',').map((s: string) => s.replace(/"/g, '').trim()).filter((s: string) => s) :
            [];
          
          return {
            summary,
            keyPoints,
            decisions,
            nextSteps: decisions, // Use decisions as next steps if available
            actionItems,
            sentimentAnalysis: { overall: 75, positive: 5, negative: 1 },
            speakerAnalysis: 'Analysis completed with manual parsing',
            duration: 30,
            participantCount: 4,
            overallSentiment: 'positive'
          };
        } catch (manualParseError) {
          // Final fallback
          return {
            summary: 'Meeting analysis completed - JSON parsing failed',
            keyPoints: ['Analysis data available but parsing failed'],
            decisions: [],
            nextSteps: [],
            actionItems: [],
            sentimentAnalysis: { overall: 50 },
            speakerAnalysis: 'Analysis completed with Groq',
            duration: 30,
            participantCount: 2,
            overallSentiment: 'neutral'
          };
        }
      }
    }
  }
}

// Fallback Local Analysis (No API needed)
class LocalProvider implements AIProvider {
  name = 'Local';

  async isAvailable(): Promise<boolean> {
    return true; // Always available
  }

  async analyze(content: string) {
    // Simple local analysis without AI
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const estimatedDuration = Math.ceil(words / 150); // ~150 words per minute speaking
    
    // Extract potential action items (lines with "action", "todo", "follow up", etc.)
    const actionKeywords = /\b(action|todo|follow.?up|next.?step|assign|task|deadline|due)\b/gi;
    const actionItems = content.split('\n')
      .filter(line => actionKeywords.test(line))
      .slice(0, 5)
      .map(line => line.trim());

    // Extract potential decisions (lines with "decide", "agreed", "resolved", etc.)
    const decisionKeywords = /\b(decide|decided|agreed|resolved|conclusion|final)\b/gi;
    const decisions = content.split('\n')
      .filter(line => decisionKeywords.test(line))
      .slice(0, 5)
      .map(line => line.trim());

    // Simple sentiment analysis based on keywords
    const positiveWords = /\b(good|great|excellent|success|agree|positive|happy|satisfied)\b/gi;
    const negativeWords = /\b(bad|terrible|problem|issue|concern|negative|unhappy|dissatisfied)\b/gi;
    
    const positiveCount = (content.match(positiveWords) || []).length;
    const negativeCount = (content.match(negativeWords) || []).length;
    
    let overallSentiment = 'neutral';
    if (positiveCount > negativeCount + 2) overallSentiment = 'positive';
    else if (negativeCount > positiveCount + 2) overallSentiment = 'negative';

    return {
      summary: `Meeting transcript analyzed locally. Contains approximately ${words} words and ${sentences} sentences. Estimated duration: ${estimatedDuration} minutes.`,
      keyPoints: [
        `Word count: ${words}`,
        `Estimated speaking time: ${estimatedDuration} minutes`,
        `Sentence count: ${sentences}`,
        'Local analysis - upgrade to AI provider for detailed insights'
      ],
      decisions: decisions.length > 0 ? decisions : ['No clear decisions detected in local analysis'],
      nextSteps: actionItems.length > 0 ? actionItems : ['No clear action items detected in local analysis'],
      actionItems: actionItems,
      sentimentAnalysis: {
        positive: positiveCount,
        negative: negativeCount,
        overall: overallSentiment
      },
      speakerAnalysis: 'Speaker analysis requires AI provider',
      duration: estimatedDuration,
      participantCount: Math.max(1, Math.ceil(words / 500)), // Rough estimate
      overallSentiment
    };
  }
}

// Provider Manager
export class AIProviderManager {
  private providers: AIProvider[] = [
    new GroqProvider(),      // Try Groq first (free and reliable)
    new OpenAIProvider(),    // Then OpenAI (if quota available)
    new LocalProvider()      // Finally local fallback
  ];

  async getAvailableProvider(): Promise<AIProvider> {
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        console.log(`Using AI provider: ${provider.name}`);
        return provider;
      }
    }
    
    // Fallback to local (always available)
    return this.providers[this.providers.length - 1];
  }

  async analyzeContent(content: string) {
    // Try providers in order until one works
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        try {
          console.log(`Trying AI provider: ${provider.name}`);
          return await provider.analyze(content);
        } catch (error: any) {
          console.error(`Analysis failed with ${provider.name}:`, error.message);
          
          // If it's a quota/rate limit error, try next provider
          if (error.status === 429 || error.code === 'insufficient_quota' || error.message.includes('quota')) {
            console.log(`${provider.name} quota exceeded, trying next provider...`);
            continue;
          }
          
          // For other errors, also try next provider
          console.log(`${provider.name} failed, trying next provider...`);
          continue;
        }
      }
    }
    
    // If all providers failed, throw error
    throw new Error('All AI providers failed or are unavailable');
  }
}