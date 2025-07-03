// Test AI providers
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
try {
  const envFile = readFileSync(join(process.cwd(), '.env'), 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !value.startsWith('#')) {
        process.env[key.trim()] = value;
      }
    }
  });
} catch (error) {
  console.log('No .env file found or error reading it');
}

import { AIProviderManager } from './server/services/aiProviders.js';

async function testProviders() {
  console.log('🧪 Testing AI Providers...\n');
  
  console.log('Environment variables:');
  console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');
  console.log('- GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Set' : 'Not set');
  console.log('');
  
  const aiManager = new AIProviderManager();
  
  try {
    const provider = await aiManager.getAvailableProvider();
    console.log(`✅ Available provider: ${provider.name}`);
    
    // Test with sample content
    const sampleContent = `
Meeting: Weekly Team Standup
Date: January 15, 2024
Attendees: John, Sarah, Mike

John: Good morning everyone. Let's start with our weekly standup.
Sarah: I completed the user authentication feature. It's ready for testing.
Mike: I'm working on the database optimization. Should be done by Friday.
John: Great work team. Sarah, can you help Mike with testing once he's done?
Sarah: Absolutely, I'll be available.
John: Perfect. Any blockers?
Mike: No blockers for me.
Sarah: All good here too.
John: Excellent. Let's meet again next week. Meeting adjourned.
    `;
    
    console.log('\n🔄 Testing analysis...');
    const result = await aiManager.analyzeContent(sampleContent);
    
    console.log('\n📊 Analysis Result:');
    console.log('- Summary:', result.summary);
    console.log('- Key Points:', result.keyPoints?.length || 0, 'items');
    console.log('- Decisions:', result.decisions?.length || 0, 'items');
    console.log('- Action Items:', result.actionItems?.length || 0, 'items');
    console.log('- Overall Sentiment:', result.overallSentiment);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProviders();