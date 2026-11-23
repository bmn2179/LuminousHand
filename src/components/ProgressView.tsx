import React from 'react';
import { Award, RotateCcw, Star } from 'lucide-react';
import {
  ALPHABET_LESSONS,
  COLOR_LESSONS,
  NUMBER_LESSONS,
  TOTAL_LESSON_COUNT,
} from '../data/curriculum';
import type { AslVideoEntry, LearningWorkflow } from '../types/luminous';

interface ProgressViewProps {
  learnerName: string;
  completedLessons: string[];
  videos: AslVideoEntry[];
  workflows: LearningWorkflow[];
  onToggleLesson: (lessonId: string) => void;
  onResetProgress: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  learnerName,
  completedLessons,
  videos,
  workflows,
  onToggleLesson,
  onResetProgress,
}) => {
  const totalDone = completedLessons.length;
  const pct = Math.round((totalDone / TOTAL_LESSON_COUNT) * 100);
  const alphaDone = ALPHABET_LESSONS.filter((l) => completedLessons.includes(l.id)).length;
  const numDone = NUMBER_LESSONS.filter((n) => completedLessons.includes(n.id)).length;
  const colorDone = COLOR_LESSONS.filter((c) => completedLessons.includes(c.id)).length;
  const verifiedVideos = videos.filter((v) => v.verified && v.videoUrl).length;

  const milestone =
    totalDone === TOTAL_LESSON_COUNT
      ? 'Luminous Master'
      : totalDone >= 30
        ? 'Shining Explorer'
        : totalDone >= 15
          ? 'Curious Signer'
          : totalDone >= 1
            ? 'Bright Beginner'
            : 'Ready to Shine';

  const badges = [
    {
      title: 'First Steps',
      desc: 'Complete your first tracing or ASL lesson',
      earned: totalDone >= 1,
    },
    {
      title: 'Alphabet A–E Starter',
      desc: 'Finish letters A, B, C, D, and E',
      earned: ['letter-A', 'letter-B', 'letter-C', 'letter-D', 'letter-E'].every((id) =>
        completedLessons.includes(id)
      ),
    },
    {
      title: 'Alphabet Ace (26/26)',
      desc: 'Complete every letter A through Z',
      earned: alphaDone === ALPHABET_LESSONS.length,
    },
    {
      title: 'Number Ninja (10/10)',
      desc: 'Count and sign all numbers 1 through 10',
      earned: numDone === NUMBER_LESSONS.length,
    },
    {
      title: 'Color Champion (10/10)',
      desc: 'Explore all 10 bright colors with ASL',
      earned: colorDone === COLOR_LESSONS.length,
    },
    {
      title: 'Kid Video Creator',
      desc: 'Have 6+ verified ASL videos in the studio',
      earned: verifiedVideos >= 6,
    },
    {
      title: 'AI Guided Learner',
      desc: 'Generate a Supervisor Agent learning workflow',
      earned: workflows.length >= 1,
    },
    {
      title: 'Luminous Star',
      desc: 'Reach 50% or more across all 46 lessons',
      earned: pct >= 50,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Summary */}
      <section className="rounded-[28px] border-2 border-[#FFE3AA] bg-gradient-to-br from-[#FFF4D6] via-[#FFFAF0] to-[#EAF8F6] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#078F89]">
              Progress Tracker · {learnerName}
            </p>
            <h1 className="text-3xl font-extrabold text-[#24334F] mt-1">
              {milestone}
            </h1>
            <p className="text-sm text-[#51617B] mt-1">
              Every completed A–Z, 1–10, and Color lesson earns a star and updates your AI Supervisor
              workflow.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white border-2 border-[#FFD98A] px-5 py-3 text-center">
              <p className="text-xs font-bold text-[#B86E00]">Total Stars</p>
              <p className="text-2xl font-extrabold text-[#24334F] tabular-nums flex items-center gap-1.5">
                <Star className="w-5 h-5 text-[#FF9800] fill-[#FFBE1B]" />
                {totalDone} / {TOTAL_LESSON_COUNT}
              </p>
            </div>
            <button
              type="button"
              onClick={onResetProgress}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#DCE5F2] bg-white px-4 py-3 text-xs font-bold text-[#51617B] hover:bg-[#FFF2F2] hover:text-[#B3261E] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Stars
            </button>
          </div>
        </div>

        {/* Category Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-[#DCE5F2] p-4 space-y-2">
            <div className="flex justify-between text-sm font-bold text-[#24334F] tabular-nums">
              <span>Alphabet A–Z</span>
              <span>
                {alphaDone} / {ALPHABET_LESSONS.length}
              </span>
            </div>
            <div className="h-3 rounded-full bg-[#F1F5FA] overflow-hidden">
              <div
                className="h-full bg-[#FF9800]"
                style={{ width: `${Math.round((alphaDone / ALPHABET_LESSONS.length) * 100)}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-[#DCE5F2] p-4 space-y-2">
            <div className="flex justify-between text-sm font-bold text-[#24334F] tabular-nums">
              <span>Numbers 1–10</span>
              <span>
                {numDone} / {NUMBER_LESSONS.length}
              </span>
            </div>
            <div className="h-3 rounded-full bg-[#F1F5FA] overflow-hidden">
              <div
                className="h-full bg-[#078F89]"
                style={{ width: `${Math.round((numDone / NUMBER_LESSONS.length) * 100)}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-[#DCE5F2] p-4 space-y-2">
            <div className="flex justify-between text-sm font-bold text-[#24334F] tabular-nums">
              <span>Colors</span>
              <span>
                {colorDone} / {COLOR_LESSONS.length}
              </span>
            </div>
            <div className="h-3 rounded-full bg-[#F1F5FA] overflow-hidden">
              <div
                className="h-full bg-[#438CE4]"
                style={{ width: `${Math.round((colorDone / COLOR_LESSONS.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Achievement Badges */}
      <section className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-extrabold text-[#24334F] flex items-center gap-2">
          <Award className="w-5 h-5 text-[#FF9800]" />
          Achievement Badges
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className={`rounded-2xl border-2 p-4 space-y-1 ${
                badge.earned
                  ? 'border-[#FFD98A] bg-[#FFFDF7]'
                  : 'border-[#E6ECF5] bg-[#F8FAFC] opacity-70'
              }`}
            >
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#078F89]">
                {badge.earned ? 'Earned' : 'Locked'}
              </p>
              <h3 className="font-extrabold text-sm text-[#24334F]">{badge.title}</h3>
              <p className="text-xs text-[#51617B]">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Lesson Checklist Grid */}
      <section className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-[#24334F]">
            Interactive Lesson Checklist (Tap to Toggle)
          </h2>
          <p className="text-sm text-[#51617B]">
            Mark lessons complete or review finished signs across A–Z, 1–10, and Colors.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#B86E00] mb-2">
              Alphabet A–Z
            </h3>
            <div className="flex flex-wrap gap-2">
              {ALPHABET_LESSONS.map((l) => {
                const done = completedLessons.includes(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onToggleLesson(l.id)}
                    className={`min-w-[42px] h-10 px-3 rounded-xl border-2 font-extrabold text-sm cursor-pointer ${
                      done
                        ? 'bg-[#FF9800] border-[#D97C00] text-white'
                        : 'bg-[#FFFAF0] border-[#DCE5F2] text-[#24334F]'
                    }`}
                  >
                    {l.letter}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#078F89] mb-2">
              Numbers 1–10
            </h3>
            <div className="flex flex-wrap gap-2">
              {NUMBER_LESSONS.map((n) => {
                const done = completedLessons.includes(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => onToggleLesson(n.id)}
                    className={`min-w-[42px] h-10 px-3 rounded-xl border-2 font-extrabold text-sm tabular-nums cursor-pointer ${
                      done
                        ? 'bg-[#078F89] border-[#056E69] text-white'
                        : 'bg-[#FFFAF0] border-[#DCE5F2] text-[#24334F]'
                    }`}
                  >
                    {n.digit}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#2E6BB8] mb-2">
              Colors
            </h3>
            <div className="flex flex-wrap gap-2">
              {COLOR_LESSONS.map((c) => {
                const done = completedLessons.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onToggleLesson(c.id)}
                    className={`h-10 px-3.5 rounded-xl border-2 font-extrabold text-sm cursor-pointer ${
                      done
                        ? 'bg-[#438CE4] border-[#2E6BB8] text-white'
                        : 'bg-[#FFFAF0] border-[#DCE5F2] text-[#24334F]'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
