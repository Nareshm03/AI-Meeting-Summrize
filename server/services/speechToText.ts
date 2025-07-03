import FormData from 'form-data';
import fetch from 'node-fetch';

export interface TranscriptionResult {
  text: string;
  duration?: number;
}

export class SpeechToTextService {
  private groqApiKey: string;

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || '';
  }

  async transcribeAudio(audioBuffer: Buffer, filename: string): Promise<TranscriptionResult> {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured for speech-to-text');
    }

    try {
      console.log(`Starting transcription for ${filename}...`);
      
      // Create form data for Groq Whisper API
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: filename,
        contentType: this.getContentType(filename)
      });
      formData.append('model', 'whisper-large-v3');
      formData.append('response_format', 'json');
      formData.append('language', 'en'); // You can make this configurable

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          ...formData.getHeaders()
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq transcription failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json() as any;
      
      console.log(`Transcription completed for ${filename}`);
      
      return {
        text: result.text || '',
        duration: result.duration
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'mp3': return 'audio/mpeg';
      case 'wav': return 'audio/wav';
      case 'm4a': return 'audio/m4a';
      case 'mp4': return 'video/mp4';
      case 'avi': return 'video/avi';
      case 'mov': return 'video/quicktime';
      case 'webm': return 'video/webm';
      default: return 'audio/mpeg';
    }
  }

  isAudioVideoFile(filename: string): boolean {
    const ext = filename.toLowerCase().split('.').pop();
    const audioVideoExtensions = ['mp3', 'wav', 'm4a', 'mp4', 'avi', 'mov', 'webm', 'wmv'];
    return audioVideoExtensions.includes(ext || '');
  }
}

export const speechToTextService = new SpeechToTextService();