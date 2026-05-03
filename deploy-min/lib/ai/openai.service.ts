/**
 * Groq AI Service Layer
 * Centralized AI operations using Groq API (Free & Fast)
 */

import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Token usage tracking
let tokenUsage = {
  totalTokens: 0,
  promptTokens: 0,
  completionTokens: 0,
};

/**
 * Get current token usage statistics
 */
export function getTokenUsage() {
  return { ...tokenUsage };
}

/**
 * Reset token usage statistics
 */
export function resetTokenUsage() {
  tokenUsage = {
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
  };
}

/**
 * Chat completion with retry logic
 */
export async function chatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'json' | 'text';
  } = {}
) {
  const {
    model = 'llama-3.1-70b-versatile', // Groq's fastest and most capable model
    temperature = 0.7,
    maxTokens = 2000,
    responseFormat = 'text',
  } = options;

  try {
    const response = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format:
        responseFormat === 'json' ? { type: 'json_object' } : undefined,
    });

    // Track token usage
    if (response.usage) {
      tokenUsage.totalTokens += response.usage.total_tokens;
      tokenUsage.promptTokens += response.usage.prompt_tokens;
      tokenUsage.completionTokens += response.usage.completion_tokens;
    }

    return {
      success: true,
      content: response.choices[0].message.content || '',
      usage: response.usage,
    };
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return {
      success: false,
      content: '',
      error: error.message || 'AI service error',
    };
  }
}

/**
 * Chat completion with JSON response
 */
export async function chatCompletionJSON<T = any>(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const result = await chatCompletion(messages, {
    ...options,
    responseFormat: 'json',
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    const data = JSON.parse(result.content);
    return { success: true, data };
  } catch (error) {
    console.error('JSON parse error:', error);
    return { success: false, error: 'Failed to parse AI response as JSON' };
  }
}

/**
 * Simple text completion
 */
export async function simpleCompletion(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<{ success: boolean; content: string; error?: string }> {
  const messages = [{ role: 'user' as const, content: prompt }];
  return chatCompletion(messages, options);
}

/**
 * Stream chat completion (for real-time responses)
 */
export async function streamChatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  onChunk: (chunk: string) => void,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
) {
  const { model = 'llama-3.3-70b-versatile', temperature = 0.7, maxTokens = 2000 } = options;

  try {
    const stream = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        onChunk(content);
      }
    }

    return { success: true, content: fullContent };
  } catch (error: any) {
    console.error('Groq Stream Error:', error);
    return { success: false, content: '', error: error.message };
  }
}

/**
 * Rate limiting check
 */
let requestCount = 0;
let resetTime = Date.now() + 60 * 60 * 1000; // 1 hour

export function checkRateLimit(maxRequests = 100): boolean {
  if (Date.now() > resetTime) {
    requestCount = 0;
    resetTime = Date.now() + 60 * 60 * 1000;
  }

  if (requestCount >= maxRequests) {
    return false;
  }

  requestCount++;
  return true;
}

export function getRateLimitStatus() {
  return {
    requestCount,
    resetTime: new Date(resetTime),
    remaining: Math.max(0, 100 - requestCount),
  };
}
