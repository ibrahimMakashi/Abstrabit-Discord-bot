import OpenAI from 'openai';
import { env } from '../config/env.js';

const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

export const generateReportInsights = async (reportText) => {
  if (!client) {
    return {
      summary: null,
      category: null,
      priority: null,
      error: 'OpenAI API key not configured',
    };
  }

  try {
    const response = await client.responses.create({
      model: env.OPENAI_MODEL,
      input: [
        {
          role: 'system',
          content:
            'You classify Discord issue reports. Return compact JSON with summary, category, and priority. Priority must be low, medium, high, or critical.',
        },
        {
          role: 'user',
          content: reportText,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'report_insights',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              summary: { type: 'string' },
              category: { type: 'string' },
              priority: { type: 'string' },
            },
            required: ['summary', 'category', 'priority'],
          },
        },
      },
    });

    const output = JSON.parse(response.output_text);

    return {
      summary: output.summary,
      category: output.category,
      priority: output.priority,
      error: null,
    };
  } catch (error) {
    return {
      summary: null,
      category: null,
      priority: null,
      error: error.message,
    };
  }
};
