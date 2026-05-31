/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

/**
 * Returns a lazy-initialized GoogleGenAI SDK client.
 * Will throw an error if the GEMINI_API_KEY is not defined.
 */
export function getGeminiClient(customApiKey?: string): GoogleGenAI {
  if (customApiKey && customApiKey.trim() !== '') {
    return new GoogleGenAI({
      apiKey: customApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-custom',
        },
      },
    });
  }

  if (aiInstance) {
    return aiInstance;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing. Please set it in AI Studio Secrets panel.');
  }

  aiInstance = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  return aiInstance;
}

/**
 * Executes a call to the selected AI provider (Google Gemini, OpenAI, or Anthropic).
 * Automatically detects the appropriate provider based on API key prefixes:
 * - 'sk-ant-': Anthropic Claude (claude-3-5-haiku)
 * - 'sk-proj-' / 'sk-': OpenAI GPT (gpt-4o-mini)
 * - Otherwise: Google Gemini (gemini-3.5-flash)
 */
export async function callMultiProviderAI({
  systemPrompt,
  userPrompt,
  customApiKey,
  responseJson
}: {
  systemPrompt: string;
  userPrompt: string;
  customApiKey?: string;
  responseJson?: boolean;
}): Promise<string> {
  let apiKey = customApiKey?.trim() || '';
  let provider: 'gemini' | 'openai' | 'anthropic' = 'gemini';

  // 1. If key is supplied, auto-detect by prefix
  if (apiKey) {
    if (apiKey.startsWith('sk-ant-')) {
      provider = 'anthropic';
    } else if (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) {
      provider = 'openai';
    } else {
      provider = 'gemini';
    }
  } else {
    // 2. Check server-side environment keys in order
    if (process.env.GEMINI_API_KEY) {
      provider = 'gemini';
      apiKey = process.env.GEMINI_API_KEY;
    } else if (process.env.OPENAI_API_KEY) {
      provider = 'openai';
      apiKey = process.env.OPENAI_API_KEY;
    } else if (process.env.ANTHROPIC_API_KEY) {
      provider = 'anthropic';
      apiKey = process.env.ANTHROPIC_API_KEY;
    } else {
      throw new Error('No appropriate AI API key configured.');
    }
  }

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: responseJson ? 0.1 : 0.6,
        response_format: responseJson ? { type: 'json_object' } : undefined,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`OpenAI API Error: ${res.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: responseJson ? 0.1 : 0.6,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Anthropic API Error: ${res.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  // Default fallback: Gemini via official SDK
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: responseJson ? 'application/json' : undefined,
      temperature: responseJson ? 0.1 : 0.6,
    },
  });

  return response.text || '';
}

