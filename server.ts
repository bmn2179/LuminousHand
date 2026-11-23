import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadFirebaseAppletConfig(): {
  projectId: string;
  firestoreDatabaseId: string;
  storageBucket: string;
} {
  try {
    const raw = fs.readFileSync(path.resolve(__dirname, 'firebase-applet-config.json'), 'utf8');
    const parsed = JSON.parse(raw);
    return {
      projectId: String(parsed.projectId || 'luminous-hand'),
      firestoreDatabaseId: String(
        parsed.firestoreDatabaseId || 'ai-studio-971e0197-629a-421f-8a6a-26871696eea4'
      ),
      storageBucket: String(parsed.storageBucket || 'luminous-hand.firebasestorage.app'),
    };
  } catch {
    return {
      projectId: 'luminous-hand',
      firestoreDatabaseId: 'ai-studio-971e0197-629a-421f-8a6a-26871696eea4',
      storageBucket: 'luminous-hand.firebasestorage.app',
    };
  }
}

const FIREBASE_APPLET_CONFIG = loadFirebaseAppletConfig();
const PORT = Number(process.env.PORT) || 3000;
const CUSTOM_DOMAIN = process.env.CUSTOM_DOMAIN || 'https://www.luminoushand.com';
const GCS_MEDIA_BASE_URL = process.env.GCS_MEDIA_BASE_URL || '';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add your API key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://www.luminoushand.com',
      'https://luminoushand.com',
      CUSTOM_DOMAIN,
      process.env.APP_URL,
    ].filter(Boolean);

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    }
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      app: 'Luminous Hand',
      customDomain: CUSTOM_DOMAIN,
      cloudProject: FIREBASE_APPLET_CONFIG.projectId,
    });
  });

  app.get('/api/cloud-config', (_req, res) => {
    res.json({
      customDomain: CUSTOM_DOMAIN,
      mediaBaseUrl: GCS_MEDIA_BASE_URL,
      firebaseProjectId: FIREBASE_APPLET_CONFIG.projectId,
      firestoreDatabaseId: FIREBASE_APPLET_CONFIG.firestoreDatabaseId,
      storageBucket: FIREBASE_APPLET_CONFIG.storageBucket,
    });
  });

  app.post('/api/supervisor/workflow', async (req, res) => {
    try {
      const body = req.body ?? {};
      const learnerName = String(body.learnerName || 'Little Learner').slice(0, 35);
      const goal = String(
        body.goal || 'Build A-Z and 1-10 ASL tracing fluency with kid signing videos'
      ).slice(0, 300);
      const completedLessons: string[] = Array.isArray(body.completedLessons)
        ? body.completedLessons.slice(0, 60).map((x: unknown) => String(x).slice(0, 40))
        : [];
      const recordedVideosCount = Number(body.recordedVideosCount || 5);
      const totalVideosNeeded = Number(body.totalVideosNeeded || 46);
      const recentActivity = String(body.recentActivity || 'Practicing letters and numbers').slice(
        0,
        300
      );

      const ai = getAiClient();

      const prompt = [
        `You are the Luminous Hand AI Agent Supervisor for an early-childhood (ages 5-8) ASL learning & kid-signing video studio app.`,
        `Learner Name: ${learnerName}`,
        `Parent/Educator Goal: ${goal}`,
        `Completed Lessons (${completedLessons.length}/46): ${completedLessons.join(', ') || 'None yet'}`,
        `Verified ASL Kid-Signing Videos Ready: ${recordedVideosCount} of ${totalVideosNeeded} (A-E already have Google Drive videos; F-Z and 1-10 and Colors are being filmed/verified).`,
        `Recent Activity: ${recentActivity}`,
        ``,
        `Produce:`,
        `1. A clear subsequent learning workflow with title, warm family-friendly summary, primary focusArea ('alphabet' | 'numbers' | 'colors' | 'video-production'), assignedAgent, 4 to 6 ordered nextLessons (each under 55 chars), and 4 subAgentAssignments for: Lumi (alphabet), Pip (numbers), Coco (colors), and Sunny (video).`,
        `2. Five distinct RAG knowledge base files (Markdown + 4 concise retrieval chunks each):`,
        `   - supervisor-rag (Supervisor Agent RAG: master orchestration rules, learner mastery state, workflow routing, cross-platform Google Play / Apple App Store / Web readiness)`,
        `   - alphabet-agent-rag (Lumi Alphabet Agent RAG: A-Z tracing cues, phonics & ASL pairing, completed vs pending letters)`,
        `   - numbers-agent-rag (Pip Numbers Agent RAG: 1-10 counting, ASL handshape cues, completed vs pending numbers)`,
        `   - colors-agent-rag (Coco Colors Agent RAG: 10 colors, object matching, ASL sign movement cues)`,
        `   - video-studio-agent-rag (Sunny ASL Video Studio Agent RAG: filming kids signing A-Z & 1-10, ASL accuracy review checklist, Drive/MP4 publishing workflow)`,
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are the Luminous Hand AI Supervisor Agent. Be warm, accurate on ASL pedagogy for ages 5-8, concise, and strictly follow the JSON schema.',
          responseMimeType: 'application/json',
          responseSchema: {
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
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (error) {
      console.error('Supervisor workflow error:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate AI workflow.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/supervisor/rag-query', async (req, res) => {
    try {
      const body = req.body ?? {};
      const question = String(body.question || '').trim().slice(0, 400);
      if (!question) {
        res.status(400).json({ error: 'Please enter a question for the RAG knowledge base.' });
        return;
      }

      const ragFiles = Array.isArray(body.ragFiles) ? body.ragFiles.slice(0, 6) : [];
      const contextBlocks = ragFiles
        .map((file: { agentName?: string; id?: string; chunks?: string[]; markdownContent?: string }) => {
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

      res.json({ answer: response.text ?? 'No response generated.' });
    } catch (error) {
      console.error('RAG query error:', error);
      const message = error instanceof Error ? error.message : 'Failed to query RAG files.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Luminous Hand server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
