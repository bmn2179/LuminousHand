import React from 'react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Palette,
  PenTool,
  Smartphone,
  Star,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  ALPHABET_LESSONS,
  COLOR_LESSONS,
  NUMBER_LESSONS,
  TOTAL_LESSON_COUNT,
} from '../data/curriculum';
import type { AppRoute, AslVideoEntry, LearningWorkflow } from '../types/luminous';
import {
  CocoCharacter,
  LumiCharacter,
  PipCharacter,
  SunnyCharacter,
} from './Characters';

interface HomeAndDashboardProps {
  learnerName: string;
  onLearnerNameChange: (name: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  completedLessons: string[];
  videos: AslVideoEntry[];
  activeWorkflow?: LearningWorkflow;
  isSignedIn: boolean;
  onSignIn: () => void;
  onNavigate: (route: AppRoute) => void;
}

export const HomeAndDashboard: React.FC<HomeAndDashboardProps> = ({
  learnerName,
  onLearnerNameChange,
  soundEnabled,
  onToggleSound,
  completedLessons,
  videos,
  activeWorkflow,
  isSignedIn,
  onSignIn,
  onNavigate,
}) => {
  const alphaDone = ALPHABET_LESSONS.filter((l) => completedLessons.includes(l.id)).length;
  const numDone = NUMBER_LESSONS.filter((n) => completedLessons.includes(n.id)).length;
  const colorDone = COLOR_LESSONS.filter((c) => completedLessons.includes(c.id)).length;
  const totalDone = completedLessons.length;
  const progressPct = Math.round((totalDone / TOTAL_LESSON_COUNT) * 100);
  const verifiedVideoCount = videos.filter((v) => v.verified && v.videoUrl).length;
  const kidVideoCount = videos.filter((v) => v.signerType === 'kid' && v.videoUrl).length;

  return (
    <div className="space-y-12">
      {/* Vibrant Hero Banner */}
      <section className="rounded-[28px] border-2 border-[#FFE3AA] bg-gradient-to-br from-[#FFF4D6] via-[#FFFAF0] to-[#E6F8F5] p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-sm font-bold tracking-wide text-[#078F89]">
              Ages 5–8 · A–Z &amp; 1–10 Tracing + ASL · Web, Google Play &amp; Apple App Store
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#24334F] leading-[1.1] tracking-tight">
              Little hands. Bright futures.
            </h1>
            <p className="text-base sm:text-lg text-[#43536F] leading-relaxed max-w-2xl">
              Luminous Hand pairs playful letter and number tracing with kid-signed American Sign
              Language videos, colorful characters, and an AI Supervisor Agent that builds each
              child’s next learning workflow and downloadable RAG study files.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('alphabet')}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#FF9800] px-6 py-3.5 text-base font-extrabold text-white shadow-sm hover:bg-[#EA8900] transition-colors cursor-pointer"
              >
                Start Tracing &amp; ASL Labs
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('video-studio')}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#078F89] bg-white px-5 py-3.5 text-base font-bold text-[#078F89] hover:bg-[#EAF8F6] transition-colors cursor-pointer"
              >
                <Video className="w-5 h-5" />
                Record Kid ASL Videos
              </button>
              <button
                type="button"
                onClick={() => onNavigate('supervisor')}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#D2DCEF] bg-white px-5 py-3.5 text-base font-bold text-[#24334F] hover:bg-[#F3F7FD] transition-colors cursor-pointer"
              >
                <Bot className="w-5 h-5 text-[#438CE4]" />
                AI Supervisor &amp; RAG
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs sm:text-sm font-semibold text-[#51617B]">
              <span className="inline-flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#078F89]" />
                Ready for Web, Google Play &amp; Apple App Store
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Video className="w-4 h-4 text-[#FF9800]" />
                {verifiedVideoCount} / {TOTAL_LESSON_COUNT} ASL videos live ({kidVideoCount} kid-signed)
              </span>
            </div>
          </div>

          {/* Character Crew Showcase */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => onNavigate('supervisor')}
              className="rounded-2xl border-2 border-[#FFD98A] bg-white p-4 text-left hover:border-[#FFA300] transition-colors cursor-pointer"
            >
              <SunnyCharacter className="w-16 h-16" />
              <p className="mt-2 font-extrabold text-[#24334F]">Sunny</p>
              <p className="text-xs font-semibold text-[#B86E00]">AI Supervisor &amp; Video Coach</p>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('alphabet')}
              className="rounded-2xl border-2 border-[#FFD2A6] bg-white p-4 text-left hover:border-[#FF9800] transition-colors cursor-pointer"
            >
              <LumiCharacter className="w-16 h-16" />
              <p className="mt-2 font-extrabold text-[#24334F]">Lumi</p>
              <p className="text-xs font-semibold text-[#B86E00]">Alphabet A–Z &amp; Tracing</p>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('numbers')}
              className="rounded-2xl border-2 border-[#B3E4DE] bg-white p-4 text-left hover:border-[#078F89] transition-colors cursor-pointer"
            >
              <PipCharacter className="w-16 h-16" />
              <p className="mt-2 font-extrabold text-[#24334F]">Pip</p>
              <p className="text-xs font-semibold text-[#078F89]">Numbers 1–10 &amp; Counting</p>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('colors')}
              className="rounded-2xl border-2 border-[#C2DAFA] bg-white p-4 text-left hover:border-[#438CE4] transition-colors cursor-pointer"
            >
              <CocoCharacter className="w-16 h-16" />
              <p className="mt-2 font-extrabold text-[#24334F]">Coco</p>
              <p className="text-xs font-semibold text-[#2E6BB8]">Colors &amp; Sign Match</p>
            </button>
          </div>
        </div>
      </section>

      {/* Child Learning Dashboard */}
      <section className="rounded-[28px] border-2 border-[#E3EAF4] bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#078F89]">
              Family &amp; Classroom Dashboard
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#24334F] mt-1">
              Welcome, {learnerName || 'Little Learner'}
            </h2>
            <p className="text-sm text-[#51617B] mt-1">
              {isSignedIn
                ? 'Cloud sync active across Web, Android, and iOS.'
                : 'Exploring locally. Sign in with Google to save progress, videos, and RAG workflows in the cloud.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-xl border-2 border-[#DCE5F2] bg-[#FFFAF0] px-3 py-2">
              <span className="text-xs font-bold text-[#51617B]">Learner:</span>
              <input
                type="text"
                maxLength={35}
                value={learnerName}
                onChange={(e) => onLearnerNameChange(e.target.value)}
                placeholder="Child's name"
                aria-label="Learner name"
                className="w-32 bg-transparent text-sm font-bold text-[#24334F] focus:outline-none"
              />
            </label>

            <button
              type="button"
              onClick={onToggleSound}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#C5E7E2] bg-[#EDFBF9] px-4 py-2.5 text-sm font-bold text-[#078F89] hover:bg-[#DFF6F2] transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Sound {soundEnabled ? 'On' : 'Off'}
            </button>

            {!isSignedIn && (
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex items-center gap-2 rounded-xl bg-[#438CE4] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#3178D1] transition-colors cursor-pointer"
              >
                Sign In to Sync
              </button>
            )}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="rounded-2xl border border-[#E3EAF4] bg-[#FFFAF0] p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-[#24334F]">
              <Star className="w-5 h-5 text-[#FF9800] fill-[#FFBE1B]" />
              <span className="tabular-nums">
                {totalDone} of {TOTAL_LESSON_COUNT} lessons completed ({progressPct}%)
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('progress')}
              className="text-sm font-bold text-[#078F89] hover:underline cursor-pointer"
            >
              View Stars &amp; Badges →
            </button>
          </div>
          <div className="h-4 w-full rounded-full bg-[#E6ECF5] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF9800] via-[#FFBE1B] to-[#078F89] transition-all duration-300"
              style={{ width: `${Math.max(progressPct, totalDone > 0 ? 4 : 0)}%` }}
            />
          </div>
        </div>

        {/* 3 Core Learning Lab Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border-2 border-[#FFD98A] bg-[#FFFDF7] p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#FFF1CC] text-[#C47600]">
                  <PenTool className="w-6 h-6" />
                </span>
                <span className="text-sm font-bold text-[#B86E00] tabular-nums">
                  {alphaDone} / {ALPHABET_LESSONS.length}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[#24334F]">Alphabet A–Z &amp; ASL</h3>
              <p className="text-sm text-[#51617B]">
                Dotted letter tracing, spoken word cues, ASL handshape guides, and kid-signed A–Z
                videos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('alphabet')}
              className="w-full rounded-xl bg-[#FF9800] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#E78900] transition-colors cursor-pointer"
            >
              Open Alphabet Lab
            </button>
          </div>

          <div className="rounded-2xl border-2 border-[#B3E4DE] bg-[#F6FDFC] p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#DFF6F2] text-[#078F89]">
                  <CheckCircle2 className="w-6 h-6" />
                </span>
                <span className="text-sm font-bold text-[#078F89] tabular-nums">
                  {numDone} / {NUMBER_LESSONS.length}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[#24334F]">Numbers 1–10 &amp; ASL</h3>
              <p className="text-sm text-[#51617B]">
                Trace numerals 1–10, count glowing stars, practice ASL number handshapes, and take
                the counting quiz.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('numbers')}
              className="w-full rounded-xl bg-[#078F89] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#067873] transition-colors cursor-pointer"
            >
              Open Numbers Lab
            </button>
          </div>

          <div className="rounded-2xl border-2 border-[#C2DAFA] bg-[#F5F9FF] p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#E4EFFD] text-[#2E6BB8]">
                  <Palette className="w-6 h-6" />
                </span>
                <span className="text-sm font-bold text-[#2E6BB8] tabular-nums">
                  {colorDone} / {COLOR_LESSONS.length}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[#24334F]">Colors &amp; ASL Lab</h3>
              <p className="text-sm text-[#51617B]">
                Explore 10 vivid colors with spoken pronunciation, ASL movement cues, video clips,
                and color-match play.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('colors')}
              className="w-full rounded-xl bg-[#438CE4] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#3178D1] transition-colors cursor-pointer"
            >
              Open Colors Lab
            </button>
          </div>
        </div>

        {/* Active Supervisor Workflow Banner */}
        <div className="rounded-2xl border-2 border-[#D2E2FA] bg-gradient-to-r from-[#F4F8FF] to-[#FFF9EB] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#2E6BB8]">
              Next Step from Supervisor Agent · {activeWorkflow?.assignedAgent || 'Sunny'}
            </p>
            <h3 className="text-lg font-extrabold text-[#24334F]">
              {activeWorkflow?.title || 'Kick off Kid ASL Videos (A–Z & 1–10) + A–E Tracing'}
            </h3>
            <p className="text-sm text-[#51617B]">
              {activeWorkflow?.summary ||
                'Start with verified A–E ASL videos and dotted tracing, then record kid signers for F–Z and 1–10 in the Video Studio.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('supervisor')}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#24334F] px-5 py-3 text-sm font-bold text-white hover:bg-[#19243A] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            Manage Workflow &amp; RAG
          </button>
        </div>
      </section>
    </div>
  );
};
