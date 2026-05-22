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
