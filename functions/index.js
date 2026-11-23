import { GoogleGenAI, Type } from '@google/genai';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';

initializeApp();

const geminiApiKey = defineSecret('GEMINI_API_KEY');
const allowedOrigins = [
  'https://www.luminoushand.com',
  'https://luminoushand.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

function getAiClient() {
  const apiKey = geminiApiKey.value();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in Firebase Functions secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'luminous-hand',
      },
    },
  });
}

function createWorkflowPrompt(body) {
  const learnerName = String(body.learnerName || 'Little Learner').slice(0, 35);
  const goal = String(
    body.goal || 'Build A-Z and 1-10 ASL tracing fluency with kid signing videos'
  ).slice(0, 300);
  const completedLessons = Array.isArray(body.completedLessons)
    ? body.completedLessons.slice(0, 60).map((lesson) => String(lesson).slice(0, 40))
    : [];
  const recordedVideosCount = Number(body.recordedVideosCount || 5);
  const totalVideosNeeded = Number(body.totalVideosNeeded || 46);
  const recentActivity = String(
    body.recentActivity || 'Practicing letters and numbers'
  ).slice(0, 300);

  return [
    'You are the Luminous Hand AI Agent Supervisor for an early-childhood (ages 5-8) ASL learning & kid-signing video studio app.',
    `Learner Name: ${learnerName}`,
    `Parent/Educator Goal: ${goal}`,
    `Completed Lessons (${completedLessons.length}/46): ${completedLessons.join(', ') || 'None yet'}`,
    `Verified ASL Kid-Signing Videos Ready: ${recordedVideosCount} of ${totalVideosNeeded} (A-E already have Google Drive videos; F-Z and 1-10 and Colors are being filmed/verified).`,
    `Recent Activity: ${recentActivity}`,
    '',
    'Produce:',
    "1. A clear subsequent learning workflow with title, warm family-friendly summary, primary focusArea ('alphabet' | 'numbers' | 'colors' | 'video-production'), assignedAgent, 4 to 6 ordered nextLessons (each under 55 chars), and 4 subAgentAssignments for: Lumi (alphabet), Pip (numbers), Coco (colors), and Sunny (video).",
    '2. Five distinct RAG knowledge base files (Markdown + 4 concise retrieval chunks each):',
    '   - supervisor-rag (Supervisor Agent RAG: master orchestration rules, learner mastery state, workflow routing, cross-platform Google Play / Apple App Store / Web readiness)',
    '   - alphabet-agent-rag (Lumi Alphabet Agent RAG: A-Z tracing cues, phonics & ASL pairing, completed vs pending letters)',
    '   - numbers-agent-rag (Pip Numbers Agent RAG: 1-10 counting, ASL handshape cues, completed vs pending numbers)',
    '   - colors-agent-rag (Coco Colors Agent RAG: 10 colors, object matching, ASL sign movement cues)',
    '   - video-studio-agent-rag (Sunny ASL Video Studio Agent RAG: filming kids signing A-Z & 1-10, ASL accuracy review checklist, Drive/MP4 publishing workflow)',
  ].join('\n');
}

const workflowResponseSchema = {
  type: Type.OBJECT,
  properties: {
    workflow: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        focusArea: {
          type: Type.STRING,
          enum: ['alphabet', 'numbers', 'colors', 'video-production'],
        },
        assignedAgent: { type: Type.STRING },
        nextLessons: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        subAgentAssignments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              agentName: { type: Type.STRING },
              role: {
                type: Type.STRING,
                enum: ['alphabet', 'numbers', 'colors', 'video'],
              },
              task: { type: Type.STRING },
            },
            required: ['agentName', 'role', 'task'],
          },
        },
      },
      required: [
        'title',
        'summary',
        'focusArea',
        'assignedAgent',
        'nextLessons',
        'subAgentAssignments',
      ],
    },
    ragFiles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            enum: [
              'supervisor-rag',
              'alphabet-agent-rag',
              'numbers-agent-rag',
              'colors-agent-rag',
              'video-studio-agent-rag',
            ],
          },
          agentName: { type: Type.STRING },
          agentRole: {
            type: Type.STRING,
            enum: ['supervisor', 'alphabet', 'numbers', 'colors', 'video'],
          },
          markdownContent: { type: Type.STRING },
          chunks: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['id', 'agentName', 'agentRole', 'markdownContent', 'chunks'],
      },
    },
  },
  required: ['workflow', 'ragFiles'],
};

async function generateWorkflow(body) {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: createWorkflowPrompt(body),
    config: {
      systemInstruction:
        'You are the Luminous Hand AI Supervisor Agent. Be warm, accurate on ASL pedagogy for ages 5-8, concise, and strictly follow the JSON schema.',
      responseMimeType: 'application/json',
      responseSchema: workflowResponseSchema,
    },
  });
  return JSON.parse((response.text ?? '{}').trim());
}

async function answerRagQuestion(body) {
  const question = String(body.question || '').trim().slice(0, 400);
  if (!question) {
    return { status: 400, payload: { error: 'Please enter a question for the RAG knowledge base.' } };
  }

  const ragFiles = Array.isArray(body.ragFiles)
    ? body.ragFiles.slice(0, 6).filter((file) => file && typeof file === 'object')
    : [];
  const contextBlocks = ragFiles
    .map((file) => {
      const chunks = Array.isArray(file.chunks) ? file.chunks.slice(0, 10).join('\n- ') : '';
      return `### ${String(file.agentName || file.id || 'Agent')}\n- ${chunks}\n${String(file.markdownContent || '').slice(0, 1200)}`;
    })
    .join('\n\n');

  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Knowledge Base Context:\n${contextBlocks}\n\nQuestion from Parent or Educator: ${question}`,
    config: {
      systemInstruction:
        'Answer concisely using the provided Supervisor and Sub-Agent RAG files. Cite which agent RAG file(s) provided the information.',
    },
  });

  return { status: 200, payload: { answer: response.text ?? 'No response generated.' } };
}

export const supervisorApi = onRequest(
  {
    region: 'us-central1',
    cors: allowedOrigins,
    secrets: [geminiApiKey],
    maxInstances: 10,
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.set('Allow', 'POST');
      res.status(405).json({ error: 'Method not allowed.' });
      return;
    }

    const authorization = req.get('authorization') || '';
    const token = authorization.match(/^Bearer (.+)$/i)?.[1];
    if (!token) {
      res.status(401).json({ error: 'Sign in is required to use the AI Supervisor.' });
      return;
    }

    try {
      await getAuth().verifyIdToken(token);
    } catch (error) {
      console.warn('Supervisor API rejected an invalid Firebase ID token.');
      res.status(401).json({ error: 'Your sign-in has expired. Please sign in again.' });
      return;
    }

    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      res.status(400).json({ error: 'A JSON request body is required.' });
      return;
    }
    if (Buffer.byteLength(JSON.stringify(body), 'utf8') > 1024 * 1024) {
      res.status(413).json({ error: 'The request body is too large.' });
      return;
    }

    try {
      if (req.path === '/workflow') {
        res.status(200).json(await generateWorkflow(body));
        return;
      }
      if (req.path === '/rag-query') {
        const result = await answerRagQuestion(body);
        res.status(result.status).json(result.payload);
        return;
      }
      res.status(404).json({ error: 'API route not found.' });
    } catch (error) {
      console.error('Supervisor API request failed:', error);
      const message = error instanceof Error ? error.message : 'The AI request failed.';
      res.status(500).json({ error: message });
    }
  }
);
