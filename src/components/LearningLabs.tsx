import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Star,
  Volume2,
} from 'lucide-react';
import {
  ALPHABET_LESSONS,
  COLOR_LESSONS,
  NUMBER_LESSONS,
} from '../data/curriculum';
import type { AppRoute, AslVideoEntry, LessonCategory } from '../types/luminous';
import { playChime, speakWord } from '../utils/sound';
import { AslVideoPlayer } from './AslVideoPlayer';
import { CocoCharacter, LumiCharacter, PipCharacter } from './Characters';
import { TracingBoard } from './TracingBoard';

interface LearningLabsProps {
  initialTab: LessonCategory;
  onTabChange: (tab: LessonCategory) => void;
  completedLessons: string[];
  onToggleComplete: (lessonId: string) => void;
  videos: AslVideoEntry[];
  soundEnabled: boolean;
  onNavigate: (route: AppRoute) => void;
}

export const LearningLabs: React.FC<LearningLabsProps> = ({
  initialTab,
  onTabChange,
  completedLessons,
  onToggleComplete,
  videos,
  soundEnabled,
  onNavigate,
}) => {
  const [selectedLetterIdx, setSelectedLetterIdx] = useState(0);
  const [selectedNumberIdx, setSelectedNumberIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [tracePct, setTracePct] = useState(0);

  // Mini-challenge states
  const [alphaQuizIdx, setAlphaQuizIdx] = useState(0);
  const [alphaQuizMsg, setAlphaQuizMsg] = useState('');
  const [numQuizIdx, setNumQuizIdx] = useState(0);
  const [numQuizMsg, setNumQuizMsg] = useState('');
  const [colorQuizIdx, setColorQuizIdx] = useState(0);
  const [colorQuizMsg, setColorQuizMsg] = useState('');

  const videoMap = useMemo(() => {
    const map = new Map<string, AslVideoEntry>();
    for (const v of videos) {
      map.set(v.lessonId, v);
    }
    return map;
  }, [videos]);

  const currentLetter = ALPHABET_LESSONS[selectedLetterIdx] ?? ALPHABET_LESSONS[0];
  const currentNumber = NUMBER_LESSONS[selectedNumberIdx] ?? NUMBER_LESSONS[0];
  const currentColor = COLOR_LESSONS[selectedColorIdx] ?? COLOR_LESSONS[0];

  const letterQuizTarget = ALPHABET_LESSONS[alphaQuizIdx % ALPHABET_LESSONS.length];
  const letterQuizChoices = useMemo(() => {
    const idx = alphaQuizIdx % ALPHABET_LESSONS.length;
    const alt1 = ALPHABET_LESSONS[(idx + 4) % ALPHABET_LESSONS.length];
    const alt2 = ALPHABET_LESSONS[(idx + 11) % ALPHABET_LESSONS.length];
    return [letterQuizTarget, alt1, alt2].sort((a, b) => a.letter.localeCompare(b.letter));
  }, [alphaQuizIdx, letterQuizTarget]);

  const numberQuizTarget = NUMBER_LESSONS[numQuizIdx % NUMBER_LESSONS.length];
  const numberQuizChoices = useMemo(() => {
    const idx = numQuizIdx % NUMBER_LESSONS.length;
    const alt1 = NUMBER_LESSONS[(idx + 2) % NUMBER_LESSONS.length];
    const alt2 = NUMBER_LESSONS[(idx + 5) % NUMBER_LESSONS.length];
    return [numberQuizTarget, alt1, alt2].sort((a, b) => a.digit - b.digit);
  }, [numQuizIdx, numberQuizTarget]);

  const colorQuizTarget = COLOR_LESSONS[colorQuizIdx % COLOR_LESSONS.length];
  const colorQuizChoices = useMemo(() => {
    const idx = colorQuizIdx % COLOR_LESSONS.length;
    const alt1 = COLOR_LESSONS[(idx + 2) % COLOR_LESSONS.length];
    const alt2 = COLOR_LESSONS[(idx + 5) % COLOR_LESSONS.length];
    const alt3 = COLOR_LESSONS[(idx + 7) % COLOR_LESSONS.length];
    return [colorQuizTarget, alt1, alt2, alt3].sort((a, b) => a.name.localeCompare(b.name));
  }, [colorQuizIdx, colorQuizTarget]);

  const markComplete = (id: string, spoken: string) => {
    if (!completedLessons.includes(id)) {
      onToggleComplete(id);
    }
    playChime(soundEnabled, 'success');
    speakWord(soundEnabled, `Great job! ${spoken}`);
  };

  return (
    <div className="space-y-8">
      {/* Lab Switcher Bar */}
      <div className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24334F]">
            Interactive Tracing &amp; ASL Labs
          </h1>
          <p className="text-sm text-[#51617B]">
            Practice A–Z letters, 1–10 numbers, and 10 colors with ASL demonstrations and tracing.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onTabChange('alphabet')}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
              initialTab === 'alphabet'
                ? 'bg-[#FF9800] text-white'
                : 'bg-[#FFF5DF] text-[#9A5E00] hover:bg-[#FFE9BE]'
            }`}
          >
            Alphabet A–Z
          </button>
          <button
            type="button"
            onClick={() => onTabChange('numbers')}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
              initialTab === 'numbers'
                ? 'bg-[#078F89] text-white'
                : 'bg-[#E8F8F5] text-[#078F89] hover:bg-[#D2F2EC]'
            }`}
          >
            Numbers 1–10
          </button>
          <button
            type="button"
            onClick={() => onTabChange('colors')}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
              initialTab === 'colors'
                ? 'bg-[#438CE4] text-white'
                : 'bg-[#EDF4FE] text-[#2E6BB8] hover:bg-[#DCEBFC]'
            }`}
          >
            Colors (10)
          </button>
        </div>
      </div>

      {/* ALPHABET A-Z LAB */}
      {initialTab === 'alphabet' && (
        <div className="space-y-6">
          {/* Letter Selector A-Z */}
          <div className="rounded-3xl border-2 border-[#FFE3AA] bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <LumiCharacter className="w-12 h-12 shrink-0" />
                <div>
                  <h2 className="text-xl font-extrabold text-[#24334F]">
                    Pick any letter A–Z
                  </h2>
                  <p className="text-xs text-[#51617B]">
                    Teal outline = completed · Video dot = ASL video ready
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#B86E00] tabular-nums">
                {ALPHABET_LESSONS.filter((l) => completedLessons.includes(l.id)).length} / 26 completed
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-2">
              {ALPHABET_LESSONS.map((item, idx) => {
                const isSelected = idx === selectedLetterIdx;
                const isDone = completedLessons.includes(item.id);
                const hasVid = Boolean(videoMap.get(item.id)?.videoUrl || videoMap.get(item.id)?.localPreviewUrl);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedLetterIdx(idx);
                      playChime(soundEnabled, 'tap');
                      speakWord(soundEnabled, `${item.letter} is for ${item.word}`);
                    }}
                    className={`relative min-h-[46px] rounded-xl border-2 font-extrabold text-lg transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#FF9800] border-[#D97C00] text-white shadow-sm'
                        : isDone
                          ? 'bg-[#E8F8F5] border-[#078F89] text-[#078F89]'
                          : 'bg-[#FFFAF0] border-[#DCE5F2] text-[#24334F] hover:border-[#FF9800]'
                    }`}
                  >
                    {item.letter}
                    {hasVid && (
                      <span
                        title="ASL Video Linked"
                        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-[#438CE4]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Letter Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Letter Card + ASL Video */}
            <div className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#FFF3D7] border-2 border-[#FFBE1B] flex items-center justify-center text-5xl font-extrabold text-[#24334F]">
                    {currentLetter.letter}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#B86E00]">
                      Letter &amp; Sign Card
                    </p>
                    <h3 className="text-2xl font-extrabold text-[#24334F]">
                      {currentLetter.letter} is for {currentLetter.word}{' '}
                      <span aria-hidden="true">{currentLetter.emoji}</span>
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    speakWord(soundEnabled, `${currentLetter.letter} is for ${currentLetter.word}`)
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#EDFBF9] border-2 border-[#C5E7E2] px-4 py-2.5 text-sm font-bold text-[#078F89] hover:bg-[#DCF6F2] shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  Speak
                </button>
              </div>

              <AslVideoPlayer
                video={videoMap.get(currentLetter.id)}
                aslCue={currentLetter.aslCue}
                onOpenStudio={() => onNavigate('video-studio')}
              />
            </div>

            {/* Right: Tracing + Actions */}
            <div className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#24334F]">
                    Trace Letter {currentLetter.letter}
                  </h3>
                  <p className="text-sm text-[#51617B]">
                    Use your finger, stylus, or mouse to trace over the dotted outline.
                  </p>
                </div>

                <TracingBoard
                  glyph={currentLetter.letter}
                  accentColor="#FF9800"
                  onTraceProgress={setTracePct}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6ECF5]">
                <button
                  type="button"
                  onClick={() => markComplete(currentLetter.id, `${currentLetter.letter} is for ${currentLetter.word}`)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold transition-colors cursor-pointer ${
                    completedLessons.includes(currentLetter.id)
                      ? 'bg-[#078F89] text-white'
                      : tracePct >= 40
                        ? 'bg-[#FF9800] text-white hover:bg-[#E78900]'
                        : 'bg-[#24334F] text-white hover:bg-[#19243A]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completedLessons.includes(currentLetter.id)
                    ? `Letter ${currentLetter.letter} Completed`
                    : `Mark ${currentLetter.letter} Complete`}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = (selectedLetterIdx + 1) % ALPHABET_LESSONS.length;
                    setSelectedLetterIdx(next);
                    playChime(soundEnabled, 'tap');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#DCE5F2] bg-white px-4 py-3 text-sm font-bold text-[#24334F] hover:bg-[#F3F7FD] cursor-pointer"
                >
                  Next Letter
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Alphabet Mini Quiz */}
          <div className="rounded-3xl border-2 border-[#DCE5F2] bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#438CE4]" />
                <h3 className="text-lg font-extrabold text-[#24334F]">
                  Mini Letter Challenge: Find the letter for {letterQuizTarget.word}{' '}
                  <span aria-hidden="true">{letterQuizTarget.emoji}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAlphaQuizIdx((i) => i + 1);
                  setAlphaQuizMsg('');
                }}
                className="text-sm font-bold text-[#078F89] hover:underline cursor-pointer"
              >
                New Question →
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {letterQuizChoices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => {
                    if (choice.id === letterQuizTarget.id) {
                      playChime(soundEnabled, 'success');
                      setAlphaQuizMsg(
                        `Correct! ${choice.letter} starts ${choice.word}.`
                      );
                    } else {
                      playChime(soundEnabled, 'gentle');
                      setAlphaQuizMsg(
                        `Not quite! Try looking at the first sound of ${letterQuizTarget.word}.`
                      );
                    }
                  }}
                  className="min-w-[84px] rounded-2xl border-2 border-[#DCE5F2] bg-[#FFFAF0] px-6 py-3 text-xl font-extrabold text-[#24334F] hover:border-[#FF9800] cursor-pointer"
                >
                  {choice.letter}
                </button>
              ))}
            </div>
            {alphaQuizMsg && (
              <p className="text-sm font-bold text-[#078F89]">{alphaQuizMsg}</p>
            )}
          </div>
        </div>
      )}

      {/* NUMBERS 1-10 LAB */}
      {initialTab === 'numbers' && (
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-[#B3E4DE] bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <PipCharacter className="w-12 h-12 shrink-0" />
                <div>
                  <h2 className="text-xl font-extrabold text-[#24334F]">
                    Pick a number 1–10
                  </h2>
                  <p className="text-xs text-[#51617B]">
                    Count the stars, watch the ASL handshape, and trace each number.
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#078F89] tabular-nums">
                {NUMBER_LESSONS.filter((n) => completedLessons.includes(n.id)).length} / 10 completed
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
              {NUMBER_LESSONS.map((item, idx) => {
                const isSelected = idx === selectedNumberIdx;
                const isDone = completedLessons.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedNumberIdx(idx);
                      playChime(soundEnabled, 'tap');
                      speakWord(soundEnabled, `Number ${item.digit}, ${item.word}`);
                    }}
                    className={`min-h-[50px] rounded-xl border-2 font-extrabold text-xl tabular-nums transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#078F89] border-[#056E69] text-white shadow-sm'
                        : isDone
                          ? 'bg-[#FFF5DF] border-[#FF9800] text-[#B86E00]'
                          : 'bg-[#FFFAF0] border-[#DCE5F2] text-[#24334F] hover:border-[#078F89]'
                    }`}
                  >
                    {item.digit}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#E8F8F5] border-2 border-[#9FDCD4] flex items-center justify-center text-4xl font-extrabold text-[#078F89] tabular-nums">
                    {currentNumber.digit}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#078F89]">
                      Count &amp; Sign
                    </p>
                    <h3 className="text-2xl font-extrabold text-[#24334F]">
                      {currentNumber.digit} · {currentNumber.word}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    speakWord(soundEnabled, `${currentNumber.digit}, ${currentNumber.word}`)
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#EDFBF9] border-2 border-[#C5E7E2] px-4 py-2.5 text-sm font-bold text-[#078F89] hover:bg-[#DCF6F2] shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  Speak
                </button>
              </div>

              {/* Countable Visual Stars */}
              <div className="rounded-2xl border border-[#E6ECF5] bg-[#FFFAF0] p-4">
                <p className="text-xs font-bold text-[#51617B] mb-2">
                  Count together ({currentNumber.digit} {currentNumber.digit === 1 ? 'star' : 'stars'}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: currentNumber.digit }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-7 h-7 text-[#FF9800] fill-[#FFBE1B]"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </div>

              <AslVideoPlayer
                video={videoMap.get(currentNumber.id)}
                aslCue={currentNumber.aslCue}
                onOpenStudio={() => onNavigate('video-studio')}
              />
            </div>

            <div className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#24334F]">
                    Trace Number {currentNumber.digit}
                  </h3>
                  <p className="text-sm text-[#51617B]">
                    Follow the dotted numeral slowly from top to bottom.
                  </p>
                </div>

                <TracingBoard
                  glyph={String(currentNumber.digit)}
                  accentColor="#078F89"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6ECF5]">
                <button
                  type="button"
                  onClick={() =>
                    markComplete(currentNumber.id, `Number ${currentNumber.digit}, ${currentNumber.word}`)
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold transition-colors cursor-pointer ${
                    completedLessons.includes(currentNumber.id)
                      ? 'bg-[#078F89] text-white'
                      : 'bg-[#24334F] text-white hover:bg-[#19243A]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completedLessons.includes(currentNumber.id)
                    ? `Number ${currentNumber.digit} Completed`
                    : `Mark ${currentNumber.digit} Complete`}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedNumberIdx((i) => (i + 1) % NUMBER_LESSONS.length);
                    playChime(soundEnabled, 'tap');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#DCE5F2] bg-white px-4 py-3 text-sm font-bold text-[#24334F] hover:bg-[#F3F7FD] cursor-pointer"
                >
                  Next Number
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Counting Mini Quiz */}
          <div className="rounded-3xl border-2 border-[#DCE5F2] bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#078F89]" />
                <h3 className="text-lg font-extrabold text-[#24334F]">
                  Counting Challenge: How many stars do you count?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNumQuizIdx((i) => i + 1);
                  setNumQuizMsg('');
                }}
                className="text-sm font-bold text-[#078F89] hover:underline cursor-pointer"
              >
                New Question →
              </button>
            </div>
            <div className="flex flex-wrap gap-2 py-1">
              {Array.from({ length: numberQuizTarget.digit }).map((_, i) => (
                <Star
                  key={i}
                  className="w-7 h-7 text-[#FF9800] fill-[#FFBE1B]"
                  aria-hidden="true"
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {numberQuizChoices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => {
                    if (choice.id === numberQuizTarget.id) {
                      playChime(soundEnabled, 'success');
                      setNumQuizMsg(`Yes! There are ${choice.digit} stars (${choice.word}).`);
                    } else {
                      playChime(soundEnabled, 'gentle');
                      setNumQuizMsg('Count each star once and try again!');
                    }
                  }}
                  className="min-w-[84px] rounded-2xl border-2 border-[#DCE5F2] bg-[#FFFAF0] px-6 py-3 text-xl font-extrabold text-[#24334F] hover:border-[#078F89] tabular-nums cursor-pointer"
                >
                  {choice.digit}
                </button>
              ))}
            </div>
            {numQuizMsg && (
              <p className="text-sm font-bold text-[#078F89]">{numQuizMsg}</p>
            )}
          </div>
        </div>
      )}

      {/* COLORS LAB */}
      {initialTab === 'colors' && (
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-[#C2DAFA] bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CocoCharacter className="w-12 h-12 shrink-0" />
                <div>
                  <h2 className="text-xl font-extrabold text-[#24334F]">
                    Pick a color to sign &amp; hear
                  </h2>
                  <p className="text-xs text-[#51617B]">
                    All 10 foundational colors with ASL cues and matching objects.
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#2E6BB8] tabular-nums">
                {COLOR_LESSONS.filter((c) => completedLessons.includes(c.id)).length} / 10 completed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {COLOR_LESSONS.map((item, idx) => {
                const isSelected = idx === selectedColorIdx;
                const isDone = completedLessons.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedColorIdx(idx);
                      playChime(soundEnabled, 'tap');
                      speakWord(soundEnabled, `${item.name}, like ${item.objectName}`);
                    }}
                    className={`rounded-2xl border-2 p-3 flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#24334F] bg-[#F5F9FF] shadow-sm'
                        : isDone
                          ? 'border-[#078F89] bg-[#F3FCFA]'
                          : 'border-[#DCE5F2] bg-white hover:border-[#438CE4]'
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-xl border border-[#D4DCE8] shrink-0"
                      style={{ backgroundColor: item.hex }}
                    />
                    <span className="font-extrabold text-sm text-[#24334F]">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div
                  className="rounded-2xl border-2 border-[#DCE5F2] p-8 flex flex-col items-center justify-center text-center min-h-[210px]"
                  style={{ backgroundColor: currentColor.hex }}
                >
                  <span className="text-5xl mb-2" aria-hidden="true">
                    {currentColor.emoji}
                  </span>
                  <h3
                    className={`text-4xl font-extrabold ${
                      currentColor.textLight ? 'text-white' : 'text-[#24334F]'
                    }`}
                  >
                    {currentColor.name}
                  </h3>
                  <p
                    className={`text-base font-bold mt-1 ${
                      currentColor.textLight ? 'text-white/90' : 'text-[#43536F]'
                    }`}
                  >
                    {currentColor.name} like {currentColor.objectName}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      speakWord(
                        soundEnabled,
                        `${currentColor.name}, like ${currentColor.objectName}`
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-[#EDFBF9] border-2 border-[#C5E7E2] px-4 py-2.5 text-sm font-bold text-[#078F89] hover:bg-[#DCF6F2] cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    Hear Color
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E6ECF5]">
                <button
                  type="button"
                  onClick={() => markComplete(currentColor.id, currentColor.name)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold transition-colors cursor-pointer ${
                    completedLessons.includes(currentColor.id)
                      ? 'bg-[#078F89] text-white'
                      : 'bg-[#438CE4] text-white hover:bg-[#3178D1]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completedLessons.includes(currentColor.id)
                    ? `${currentColor.name} Completed`
                    : `Mark ${currentColor.name} Complete`}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedColorIdx((i) => (i + 1) % COLOR_LESSONS.length);
                    playChime(soundEnabled, 'tap');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#DCE5F2] bg-white px-4 py-3 text-sm font-bold text-[#24334F] hover:bg-[#F3F7FD] cursor-pointer"
                >
                  Next Color
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm">
              <AslVideoPlayer
                video={videoMap.get(currentColor.id)}
                aslCue={currentColor.aslCue}
                onOpenStudio={() => onNavigate('video-studio')}
              />
            </div>
          </div>

          {/* Color Match Quiz */}
          <div className="rounded-3xl border-2 border-[#DCE5F2] bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#438CE4]" />
                <h3 className="text-lg font-extrabold text-[#24334F]">
                  Color Match: Tap the color swatch for{' '}
                  <span className="text-[#2E6BB8]">{colorQuizTarget.name}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setColorQuizIdx((i) => i + 1);
                  setColorQuizMsg('');
                }}
                className="text-sm font-bold text-[#078F89] hover:underline cursor-pointer"
              >
                New Question →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {colorQuizChoices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => {
                    if (choice.id === colorQuizTarget.id) {
                      playChime(soundEnabled, 'success');
                      setColorQuizMsg(`Bright match! That swatch is ${choice.name}.`);
                    } else {
                      playChime(soundEnabled, 'gentle');
                      setColorQuizMsg(`That one is ${choice.name}. Find ${colorQuizTarget.name}!`);
                    }
                  }}
                  aria-label={`Color swatch ${choice.name}`}
                  className="h-16 rounded-2xl border-2 border-[#DCE5F2] shadow-xs hover:scale-[1.02] transition-transform cursor-pointer"
                  style={{ backgroundColor: choice.hex }}
                />
              ))}
            </div>
            {colorQuizMsg && (
              <p className="text-sm font-bold text-[#078F89]">{colorQuizMsg}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
