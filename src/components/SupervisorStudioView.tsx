import React, { useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Download,
  FileText,
  FolderArchive,
  PlayCircle,
  Search,
} from 'lucide-react';
import {
  ALPHABET_LESSONS,
  COLOR_LESSONS,
  NUMBER_LESSONS,
} from '../data/curriculum';
import type {
  AgentRagFile,
  AppRoute,
  AslVideoEntry,
  LearningWorkflow,
} from '../types/luminous';
import { buildBaselineRagFiles } from '../utils/ragTemplates';
import {
  CocoCharacter,
  LumiCharacter,
  PipCharacter,
  SunnyCharacter,
} from './Characters';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

interface SupervisorStudioViewProps {
  learnerName: string;
  completedLessons: string[];
  videos: AslVideoEntry[];
  workflows: LearningWorkflow[];
  ragFiles: AgentRagFile[];
  onSaveGeneratedState: (
    workflow: LearningWorkflow,
    updatedRags: AgentRagFile[]
  ) => Promise<void>;
  onCompleteWorkflow: (workflowId: string) => Promise<void>;
  onNavigate: (route: AppRoute) => void;
}

export const SupervisorStudioView: React.FC<SupervisorStudioViewProps> = ({
  learnerName,
  completedLessons,
  videos,
  workflows,
  ragFiles,
  onSaveGeneratedState,
  onCompleteWorkflow,
  onNavigate,
}) => {
  const [goalInput, setGoalInput] = useState(
    'Prepare kid-signed A–Z and 1–10 ASL tracing lessons with joyful daily practice'
  );
  const [recentActivity, setRecentActivity] = useState(
    `Completed ${completedLessons.length} lessons; filming kid signers for F–Z and 1–10.`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [genSuccess, setGenSuccess] = useState('');

  const [selectedRagId, setSelectedRagId] = useState<string>('supervisor-rag');
  const [ragQuestion, setRagQuestion] = useState(
    'Which letters and kid ASL videos should we prioritize next?'
  );
  const [ragAnswer, setRagAnswer] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);

  const selectedRag =
    ragFiles.find((r) => r.id === selectedRagId) ?? ragFiles[0];

  const buildStaticFallback = (): {
    workflow: LearningWorkflow;
    ragFiles: AgentRagFile[];
  } => {
    const pendingLetters = ALPHABET_LESSONS.filter(
      (l) => !completedLessons.includes(l.id)
    ).slice(0, 3);
    const pendingNumbers = NUMBER_LESSONS.filter(
      (n) => !completedLessons.includes(n.id)
    ).slice(0, 2);
    const pendingColors = COLOR_LESSONS.filter(
      (c) => !completedLessons.includes(c.id)
    ).slice(0, 2);
    const missingVideos = videos.filter((v) => !v.videoUrl && !v.localPreviewUrl);

    const nextLessons = [
      ...pendingLetters.map((l) => `Trace & sign Letter ${l.letter} (${l.word})`),
      ...pendingNumbers.map((n) => `Count & sign Number ${n.digit} (${n.word})`),
      ...pendingColors.map((c) => `Sign & match Color ${c.name}`),
    ].slice(0, 6);

    if (missingVideos.length > 0 && nextLessons.length < 6) {
      nextLessons.push(`Record or link ASL video for ${missingVideos[0].label}`);
    }

    const focusArea: LearningWorkflow['focusArea'] =
      pendingLetters.length > 0
        ? 'alphabet'
        : pendingNumbers.length > 0
          ? 'numbers'
          : pendingColors.length > 0
            ? 'colors'
            : 'video-production';

    const workflow: LearningWorkflow = {
      id: `wf_${Date.now()}`,
      title: `Next Steps for ${learnerName}: ${focusArea === 'alphabet' ? 'A–Z Tracing & ASL' : focusArea === 'numbers' ? '1–10 Counting & ASL' : 'Colors & Video Review'}`.slice(
        0,
        120
      ),
      summary: `Goal: ${goalInput.slice(0, 180)}. ${learnerName} has completed ${completedLessons.length}/46 lessons with ${videos.length - missingVideos.length}/${videos.length} ASL videos connected.`,
      focusArea,
      assignedAgent: 'Sunny · Supervisor Agent',
      nextLessons:
        nextLessons.length > 0
          ? nextLessons
          : ['Review favorite A–Z, 1–10 & Color ASL signs'],
      status: 'active',
      subAgentAssignments: [
        {
          agentName: 'Lumi',
          role: 'alphabet',
          task:
            pendingLetters.length > 0
              ? `Guide dotted tracing for ${pendingLetters.map((l) => l.letter).join(', ')}.`
              : 'Review all 26 A–Z handshapes.',
        },
        {
          agentName: 'Pip',
          role: 'numbers',
          task:
            pendingNumbers.length > 0
              ? `Practice counting stars & signing ${pendingNumbers.map((n) => n.digit).join(', ')}.`
              : 'Review numbers 1–10.',
        },
        {
          agentName: 'Coco',
          role: 'colors',
          task:
            pendingColors.length > 0
              ? `Play Color Match for ${pendingColors.map((c) => c.name).join(', ')}.`
              : 'Review all 10 Color signs.',
        },
        {
          agentName: 'Sunny',
          role: 'video',
          task:
            missingVideos.length > 0
              ? `Add kid ASL clips for ${missingVideos
                  .slice(0, 3)
                  .map((v) => v.label)
                  .join(', ')}.`
              : 'All 46 ASL clips linked!',
        },
      ],
      createdAtIso: new Date().toISOString(),
    };

    const existingVersionMap = new Map(ragFiles.map((r) => [r.id, r.version]));
    const refreshedRags = buildBaselineRagFiles(
      learnerName,
      completedLessons,
      videos
    ).map((r) => ({
      ...r,
      version: (existingVersionMap.get(r.id) || 0) + 1,
      markdownContent: `${r.markdownContent}\n\n## Latest Goal\n${goalInput}\n\n## Recent Observation\n${recentActivity}`,
    }));

    return { workflow, ragFiles: refreshedRags };
  };

  const handleGenerateWorkflowAndRags = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenError('');
    setGenSuccess('');

    try {
      const recordedVideosCount = videos.filter(
        (v) => v.verified && (v.videoUrl || v.localPreviewUrl)
      ).length;

      let usedStaticFallback = false;
      let generatedWorkflow: LearningWorkflow | null = null;
      let generatedRags: AgentRagFile[] | null = null;

      try {
        const resp = await fetch(`${API_BASE}/api/supervisor/workflow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            learnerName,
            goal: goalInput,
            completedLessons,
            recordedVideosCount,
            totalVideosNeeded: videos.length,
            recentActivity,
          }),
        });

        const contentType = resp.headers.get('content-type') || '';
        if (resp.ok && contentType.includes('application/json')) {
          const data = await resp.json();
          const wfPayload = data.workflow || {};
          generatedWorkflow = {
            id: `wf_${Date.now()}`,
            title: String(wfPayload.title || 'Subsequent ASL & Tracing Workflow').slice(0, 120),
            summary: String(wfPayload.summary || '').slice(0, 1500),
            focusArea: ['alphabet', 'numbers', 'colors', 'video-production'].includes(
              wfPayload.focusArea
            )
              ? wfPayload.focusArea
              : 'alphabet',
            assignedAgent: String(wfPayload.assignedAgent || 'Sunny · Supervisor Agent').slice(
              0,
              80
            ),
            nextLessons: Array.isArray(wfPayload.nextLessons)
              ? wfPayload.nextLessons.slice(0, 12).map((s: unknown) => String(s).slice(0, 60))
              : [],
            status: 'active',
            subAgentAssignments: Array.isArray(wfPayload.subAgentAssignments)
              ? wfPayload.subAgentAssignments
              : [],
            createdAtIso: new Date().toISOString(),
          };

          const existingVersionMap = new Map(ragFiles.map((r) => [r.id, r.version]));
          generatedRags = Array.isArray(data.ragFiles)
            ? data.ragFiles.map((raw: Partial<AgentRagFile>) => {
                const id = String(raw.id || 'supervisor-rag');
                return {
                  id,
                  agentName: String(raw.agentName || id).slice(0, 80),
                  agentRole: raw.agentRole || 'supervisor',
                  markdownContent: String(raw.markdownContent || '').slice(0, 20000),
                  chunks: Array.isArray(raw.chunks)
                    ? raw.chunks.slice(0, 30).map((c) => String(c).slice(0, 600))
                    : [],
                  version: (existingVersionMap.get(id) || 0) + 1,
                  updatedAtIso: new Date().toISOString(),
                };
              })
            : ragFiles;
        } else {
          usedStaticFallback = true;
        }
      } catch {
        usedStaticFallback = true;
      }

      if (usedStaticFallback || !generatedWorkflow || !generatedRags) {
        const fallback = buildStaticFallback();
        generatedWorkflow = fallback.workflow;
        generatedRags = fallback.ragFiles;
        usedStaticFallback = true;
      }

      await onSaveGeneratedState(generatedWorkflow, generatedRags);
      setGenSuccess(
        usedStaticFallback
          ? 'Generated updated subsequent workflow and refreshed all 5 RAG files (static GitHub Pages mode). Connect VITE_API_BASE_URL for live Gemini AI orchestration.'
          : 'Generated new subsequent workflow via Gemini AI Supervisor and refreshed all 5 RAG files.'
      );
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Unable to generate workflow.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQueryRag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuestion.trim()) return;
    setIsQuerying(true);
    setRagAnswer('');
    try {
      const resp = await fetch(`${API_BASE}/api/supervisor/rag-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: ragQuestion,
          ragFiles,
        }),
      });
      const contentType = resp.headers.get('content-type') || '';
      if (resp.ok && contentType.includes('application/json')) {
        const data = await resp.json();
        setRagAnswer(data.answer || 'No answer returned.');
        return;
      }
      throw new Error('Static fallback');
    } catch {
      const keywords = ragQuestion
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 2);
      const matches: string[] = [];
      for (const file of ragFiles) {
        for (const chunk of file.chunks) {
          const lower = chunk.toLowerCase();
          if (keywords.some((k) => lower.includes(k))) {
            matches.push(`[${file.id}.md] ${chunk}`);
          }
        }
      }
      setRagAnswer(
        matches.length > 0
          ? matches.slice(0, 6).join('\n\n')
          : ragFiles.map((f) => `[${f.id}.md] ${f.chunks[0] || ''}`).join('\n\n')
      );
    } finally {
      setIsQuerying(false);
    }
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllRagsBundle = () => {
    const bundle = {
      app: 'Luminous Hand',
      exportedAt: new Date().toISOString(),
      learnerName,
      supervisorAndAgentRags: ragFiles,
      workflows,
    };
    downloadFile(
      'luminous-hand-all-agent-rag-files.json',
      JSON.stringify(bundle, null, 2),
      'application/json'
    );
  };

  const routeFromFocus = (
    focus: LearningWorkflow['focusArea']
  ): AppRoute => {
    if (focus === 'numbers') return 'numbers';
    if (focus === 'colors') return 'colors';
    if (focus === 'video-production') return 'video-studio';
    return 'alphabet';
  };

  return (
    <div className="space-y-8">
      {/* Supervisor & Sub-Agent Crew Overview */}
      <section className="rounded-[28px] border-2 border-[#C2DAFA] bg-gradient-to-br from-[#EEF5FF] via-[#FFFAF0] to-[#E8F8F5] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#2E6BB8]">
              Multi-Agent Orchestration · Supervisor + 4 Sub-Agents
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24334F]">
              AI Supervisor Workflow &amp; Agent RAG Files
            </h1>
            <p className="text-sm text-[#51617B] max-w-3xl">
              The Supervisor Agent tracks {learnerName}’s A–Z, 1–10, Colors, and Kid ASL Video
              Studio progress, creates subsequent learning workflows, and maintains 5 downloadable
              RAG knowledge files (1 Supervisor RAG + 4 Sub-Agent RAGs).
            </p>
          </div>
          <button
            type="button"
            onClick={downloadAllRagsBundle}
            className="inline-flex items-center gap-2 rounded-xl bg-[#24334F] px-4 py-3 text-sm font-bold text-white hover:bg-[#19243A] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FolderArchive className="w-4 h-4" />
            Download All 5 RAG Files (.json)
          </button>
        </div>

        {/* 4 Specialist Sub-Agents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-[#FFD2A6] bg-white p-4 flex items-center gap-3">
            <LumiCharacter className="w-12 h-12 shrink-0" />
            <div>
              <p className="font-extrabold text-sm text-[#24334F]">Lumi · Alphabet Agent</p>
              <p className="text-xs text-[#51617B]">alphabet-agent-rag.md</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#B3E4DE] bg-white p-4 flex items-center gap-3">
            <PipCharacter className="w-12 h-12 shrink-0" />
            <div>
              <p className="font-extrabold text-sm text-[#24334F]">Pip · Numbers Agent</p>
              <p className="text-xs text-[#51617B]">numbers-agent-rag.md</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#C2DAFA] bg-white p-4 flex items-center gap-3">
            <CocoCharacter className="w-12 h-12 shrink-0" />
            <div>
              <p className="font-extrabold text-sm text-[#24334F]">Coco · Colors Agent</p>
              <p className="text-xs text-[#51617B]">colors-agent-rag.md</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#FFD98A] bg-white p-4 flex items-center gap-3">
            <SunnyCharacter className="w-12 h-12 shrink-0" />
            <div>
              <p className="font-extrabold text-sm text-[#24334F]">Sunny · Video Studio</p>
              <p className="text-xs text-[#51617B]">video-studio-agent-rag.md</p>
            </div>
          </div>
        </div>
      </section>

      {/* Generate Subsequent Workflow Form + Workflow List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleGenerateWorkflowAndRags}
          className="lg:col-span-5 rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#438CE4]" />
            <h2 className="text-xl font-extrabold text-[#24334F]">
              Run Supervisor Agent
            </h2>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-[#51617B]">
              Parent / Educator Goal for {learnerName}
            </span>
            <textarea
              rows={3}
              maxLength={300}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="w-full rounded-xl border-2 border-[#DCE5F2] bg-[#FFFAF0] p-3 text-sm font-medium text-[#24334F] focus:border-[#438CE4] focus:outline-none"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-[#51617B]">
              Recent Observation / Notes
            </span>
            <textarea
              rows={2}
              maxLength={300}
              value={recentActivity}
              onChange={(e) => setRecentActivity(e.target.value)}
              className="w-full rounded-xl border-2 border-[#DCE5F2] bg-[#FFFAF0] p-3 text-sm font-medium text-[#24334F] focus:border-[#438CE4] focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full rounded-xl bg-[#438CE4] px-5 py-3.5 text-sm font-extrabold text-white hover:bg-[#3178D1] disabled:opacity-60 transition-colors cursor-pointer"
          >
            {isGenerating
              ? 'Supervisor Agent Generating Workflow & 5 RAG Files...'
              : 'Generate Subsequent Workflow & Update RAG Files'}
          </button>

          {genError && (
            <p className="rounded-xl border border-[#F5B5B5] bg-[#FFF2F2] p-3 text-xs font-bold text-[#B3261E]">
              {genError}
            </p>
          )}
          {genSuccess && (
            <p className="rounded-xl border border-[#B3E4DE] bg-[#E8F8F5] p-3 text-xs font-bold text-[#078F89]">
              {genSuccess}
            </p>
          )}
        </form>

        {/* Active & Subsequent Workflows */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#24334F]">
              Subsequent Learning Workflows ({workflows.length})
            </h2>
          </div>

          {workflows.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#DCE5F2] bg-[#FFFAF0] p-6 text-center space-y-2">
              <p className="font-bold text-[#24334F]">
                No custom workflow generated yet
              </p>
              <p className="text-sm text-[#51617B]">
                Run the Supervisor Agent on the left to generate a personalized workflow and refresh
                all 5 RAG knowledge files.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className={`rounded-2xl border-2 p-4 space-y-3 ${
                    wf.status === 'completed'
                      ? 'border-[#B3E4DE] bg-[#F5FCFB]'
                      : 'border-[#FFD98A] bg-[#FFFDF7]'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-extrabold text-[#078F89]">
                        {wf.assignedAgent} · {wf.focusArea} ·{' '}
                        {wf.status === 'completed' ? 'Completed' : 'Active'}
                      </p>
                      <h3 className="text-lg font-extrabold text-[#24334F]">{wf.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigate(routeFromFocus(wf.focusArea))}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF9800] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#E78900] cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Open Lab
                      </button>
                      {wf.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => onCompleteWorkflow(wf.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#078F89] bg-white px-3 py-1.5 text-xs font-bold text-[#078F89] hover:bg-[#EDFBF9] cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-[#43536F]">{wf.summary}</p>

                  {wf.nextLessons.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#51617B]">Ordered Next Steps:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs font-semibold text-[#24334F]">
                        {wf.nextLessons.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {wf.subAgentAssignments && wf.subAgentAssignments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {wf.subAgentAssignments.map((sub, i) => (
                        <div
                          key={i}
                          className="rounded-xl bg-white border border-[#E3EAF4] px-3 py-2 text-xs"
                        >
                          <span className="font-extrabold text-[#24334F]">{sub.agentName}: </span>
                          <span className="text-[#51617B]">{sub.task}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5 RAG Knowledge Files Inspector & Query */}
      <section className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-[#24334F] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#078F89]" />
              Supervisor &amp; Sub-Agent RAG Files (5 Knowledge Bases)
            </h2>
            <p className="text-sm text-[#51617B]">
              Inspect, query, or export any agent’s `.md` or `.json` RAG knowledge file.
            </p>
          </div>
        </div>

        {/* RAG File Tabs */}
        <div className="flex flex-wrap gap-2">
          {ragFiles.map((rag) => (
            <button
              key={rag.id}
              type="button"
              onClick={() => setSelectedRagId(rag.id)}
              className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                selectedRag?.id === rag.id
                  ? 'bg-[#24334F] text-white'
                  : 'bg-[#F3F7FD] text-[#24334F] hover:bg-[#E4ECF7]'
              }`}
            >
              {rag.id}.md (v{rag.version})
            </button>
          ))}
        </div>

        {selectedRag && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 rounded-2xl border-2 border-[#E3EAF4] bg-[#FFFAF0] p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#078F89]">
                    {selectedRag.agentName} · v{selectedRag.version}
                  </p>
                  <h3 className="text-base font-extrabold text-[#24334F]">
                    {selectedRag.id}.md
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      downloadFile(
                        `${selectedRag.id}.md`,
                        selectedRag.markdownContent,
                        'text/markdown'
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#C5E7E2] bg-white px-3 py-1.5 text-xs font-bold text-[#078F89] hover:bg-[#EDFBF9] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .md
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadFile(
                        `${selectedRag.id}.json`,
                        JSON.stringify(selectedRag, null, 2),
                        'application/json'
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE5F2] bg-white px-3 py-1.5 text-xs font-bold text-[#24334F] hover:bg-[#F3F7FD] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .json
                  </button>
                </div>
              </div>

              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#24334F] bg-white rounded-xl border border-[#E3EAF4] p-4 max-h-[340px] overflow-y-auto">
                {selectedRag.markdownContent}
              </pre>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border-2 border-[#E3EAF4] bg-[#F8FAFE] p-5 space-y-3">
                <h3 className="text-sm font-extrabold text-[#24334F]">
                  Indexed RAG Chunks ({selectedRag.chunks.length})
                </h3>
                <ul className="space-y-2 text-xs text-[#43536F]">
                  {selectedRag.chunks.map((chunk, idx) => (
                    <li
                      key={idx}
                      className="rounded-xl bg-white border border-[#E3EAF4] p-3 leading-relaxed"
                    >
                      <span className="font-bold text-[#078F89] tabular-nums">
                        Chunk {idx + 1}:{' '}
                      </span>
                      {chunk}
                    </li>
                  ))}
                </ul>
              </div>

              <form
                onSubmit={handleQueryRag}
                className="rounded-2xl border-2 border-[#C2DAFA] bg-[#F4F8FF] p-5 space-y-3"
              >
                <h3 className="text-sm font-extrabold text-[#24334F] flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#438CE4]" />
                  Ask Across All 5 RAG Files
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={400}
                    value={ragQuestion}
                    onChange={(e) => setRagQuestion(e.target.value)}
                    placeholder="Ask about next lessons, ASL handshapes, or video readiness..."
                    className="flex-1 rounded-xl border border-[#DCE5F2] bg-white px-3 py-2 text-xs font-semibold text-[#24334F] focus:border-[#438CE4] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isQuerying}
                    className="rounded-xl bg-[#438CE4] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#3178D1] disabled:opacity-60 whitespace-nowrap cursor-pointer"
                  >
                    {isQuerying ? 'Searching...' : 'Ask RAG'}
                  </button>
                </div>
                {ragAnswer && (
                  <div className="rounded-xl bg-white border border-[#DCE5F2] p-3 text-xs text-[#24334F] leading-relaxed whitespace-pre-wrap">
                    {ragAnswer}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
