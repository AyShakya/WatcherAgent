// nodes/shared/ai.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = process.env.DEFAULT_LLM_MODEL;
const JSON_ONLY_INSTRUCTION = 'CRITICAL: Return ONLY raw JSON. No markdown fences, no backticks, no preamble, no explanation. Start your response with { and end with }.';

function safeParseJSON(content) {
  const stripped = String(content ?? '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(stripped);
}

/**
 * Remove control characters (U+0000–U+001F except \t \n \r) and
 * Unicode line/paragraph separators that some JSON parsers reject.
 */
function cleanString(str) {
  return String(str ?? '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u2028\u2029]/g, '');
}

/**
 * Common LLM call function via OpenRouter
 */
export async function callLLM({ prompt, systemPrompt, model = DEFAULT_MODEL, responseFormat = 'json_object', maxTokens = 4096, timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS || '30000', 10), openrouterKey }) {
  if (!model) {
    console.error('❌ DEFAULT_LLM_MODEL is not defined in .env');
    throw new Error('DEFAULT_LLM_MODEL is missing from environment variables');
  }

  const apiKey = openrouterKey || OPENROUTER_API_KEY;
  console.log(`🤖 LLM Call: using model ${model}`);
  
  if (!apiKey) {
    console.warn('⚠️ OPENROUTER_API_KEY not set. LLM calls will fail.');
    throw new Error('OPENROUTER_API_KEY is missing');
  }

  const messages = [];
  if (systemPrompt || responseFormat === 'json_object') {
    const baseSystemPrompt = systemPrompt ? `${cleanString(systemPrompt)}\n\n` : '';
    const finalSystemPrompt = responseFormat === 'json_object'
      ? `${baseSystemPrompt}${JSON_ONLY_INSTRUCTION}`
      : baseSystemPrompt.trim();

    messages.push({ role: 'system', content: finalSystemPrompt });
  }
  messages.push({ role: 'user', content: cleanString(prompt) });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Manually serialize to guarantee valid JSON — bypasses any axios serialization edge cases
  const bodyPayload = {
    model,
    messages,
    max_tokens: maxTokens,
    ...(responseFormat === 'json_object' ? { response_format: { type: 'json_object' } } : {}),
  };
  const bodyString = JSON.stringify(bodyPayload);

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', bodyString, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/guardian-agent',
        'X-Title': 'Guardian AI SRE'
      },
      signal: controller.signal
    });

    const content = response.data.choices[0].message.content;
    return responseFormat === 'json_object' ? safeParseJSON(content) : content;
  } catch (error) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      throw new Error(`OpenRouter request timed out after ${timeoutMs}ms`);
    }

    const errorData = error.response?.data || error.message;
    console.error(`❌ OpenRouter API Error (${model}):`, JSON.stringify(errorData, null, 2));
    throw new Error(`OpenRouter Error: ${JSON.stringify(errorData)}`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Embedding generation using Pinecone Inference (Serverless)
 */
export async function getEmbedding(text, pc) {
  if (!text || text.trim().length === 0) {
    throw new Error('getEmbedding: text must be a non-empty string');
  }

  try {
    // Standard serverless embedding model in Pinecone
    const model = 'multilingual-e5-large'; 
    
    // Ensure pc.inference exists
    if (!pc || !pc.inference) {
      throw new Error('Pinecone client not initialized with inference capabilities. Ensure you are using SDK v7+');
    }

    // Pinecone v7 SDK Inference Signature: embed({ model, inputs, parameters })
    const response = await pc.inference.embed({
      model: model,
      inputs: [text.slice(0, 8000)],
      parameters: { inputType: 'passage', truncate: 'END' }
    });
    
    // Pinecone v7 returns an EmbeddingsList object with a .data array
    if (response && response.data && response.data.length > 0) {
      return response.data[0].values;
    }
    
    throw new Error('getEmbedding: Pinecone returned empty embedding');
  } catch (error) {
    throw new Error(`getEmbedding failed: ${error.message}`);
  }
}
