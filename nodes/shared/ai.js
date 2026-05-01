// nodes/shared/ai.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = process.env.DEFAULT_LLM_MODEL;

/**
 * Common LLM call function via OpenRouter
 */
export async function callLLM({ prompt, systemPrompt, model = DEFAULT_MODEL, responseFormat = 'json_object' }) {
  if (!model) {
    console.error('❌ DEFAULT_LLM_MODEL is not defined in .env');
    throw new Error('DEFAULT_LLM_MODEL is missing from environment variables');
  }

  console.log(`🤖 LLM Call: using model ${model}`);
  
  if (!OPENROUTER_API_KEY) {
    console.warn('⚠️ OPENROUTER_API_KEY not set. LLM calls will fail.');
    throw new Error('OPENROUTER_API_KEY is missing');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: model,
      messages: messages,
      response_format: responseFormat === 'json_object' ? { type: 'json_object' } : undefined
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/guardian-agent',
        'X-Title': 'Guardian AI SRE'
      }
    });

    const content = response.data.choices[0].message.content;
    return responseFormat === 'json_object' ? JSON.parse(content) : content;
  } catch (error) {
    const errorData = error.response?.data || error.message;
    console.error(`❌ OpenRouter API Error (${model}):`, JSON.stringify(errorData, null, 2));
    throw new Error(`OpenRouter Error: ${JSON.stringify(errorData)}`);
  }
}

/**
 * Embedding generation using Pinecone Inference (Serverless)
 */
export async function getEmbedding(text, pc) {
  try {
    if (!text) throw new Error('No text provided for embedding');

    // Standard serverless embedding model in Pinecone
    const model = 'multilingual-e5-large'; 
    
    // Ensure pc.inference exists
    if (!pc || !pc.inference) {
      throw new Error('Pinecone client not initialized with inference capabilities. Ensure you are using SDK v7+');
    }

    // Pinecone v7 SDK Inference Signature: embed({ model, inputs, parameters })
    const response = await pc.inference.embed({
      model: model,
      inputs: [text],
      parameters: { inputType: 'passage', truncate: 'END' }
    });
    
    // Pinecone v7 returns an EmbeddingsList object with a .data array
    if (response && response.data && response.data.length > 0) {
      return response.data[0].values;
    }
    
    throw new Error('No embeddings returned from Pinecone');
  } catch (error) {
    console.error('❌ Embedding Error:', error.message);
    // Return a dummy vector if we can't get one (only for prototype stability)
    console.warn('⚠️ Falling back to zero-vector for prototype stability.');
    return new Array(1024).fill(0); 
  }
}
