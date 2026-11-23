import { ALPHABET_LESSONS, COLOR_LESSONS, NUMBER_LESSONS } from '../data/curriculum';
import type { AgentRagFile, AslVideoEntry } from '../types/luminous';

export function buildBaselineRagFiles(
  learnerName: string,
  completedLessons: string[],
  videos: AslVideoEntry[]
): AgentRagFile[] {
  const safeLearner = learnerName || 'Little Learner';
  const alphaDone = ALPHABET_LESSONS.filter((l) => completedLessons.includes(l.id)).map((l) => l.letter);
  const alphaPending = ALPHABET_LESSONS.filter((l) => !completedLessons.includes(l.id)).map((l) => l.letter);
  const numDone = NUMBER_LESSONS.filter((n) => completedLessons.includes(n.id)).map((n) => String(n.digit));
  const numPending = NUMBER_LESSONS.filter((n) => !completedLessons.includes(n.id)).map((n) => String(n.digit));
  const colorDone = COLOR_LESSONS.filter((c) => completedLessons.includes(c.id)).map((c) => c.name);
  const colorPending = COLOR_LESSONS.filter((c) => !completedLessons.includes(c.id)).map((c) => c.name);

  const verifiedVideos = videos.filter((v) => v.verified && v.videoUrl);
  const kidVideos = videos.filter((v) => v.signerType === 'kid' && v.videoUrl);
  const nowIso = new Date().toISOString();

  return [
    {
      id: 'supervisor-rag',
      agentName: 'Sunny · Supervisor Agent',
      agentRole: 'supervisor',
      version: 1,
      updatedAtIso: nowIso,
      chunks: [
        `Learner Profile: ${safeLearner} has completed ${completedLessons.length} of 46 total Luminous Hand lessons.`,
        `Routing Rule: Prioritize A-E video-backed letters first, then guide F-Z tracing and 1-10 counting in 3-lesson blocks.`,
        `Video Production Gate: ${verifiedVideos.length} of ${videos.length} ASL videos verified; prioritize kid-signing recordings for A-Z and 1-10.`,
        `Cross-Platform Policy: Sync progress under authenticated Firebase /users/{uid} for Web, Google Play, and Apple App Store parity.`,
      ],
      markdownContent: [
        `# Supervisor Agent RAG — Luminous Hand`,
        ``,
        `- **Learner:** ${safeLearner}`,
        `- **Total Completed:** ${completedLessons.length} / 46 lessons`,
        `- **Distribution Channels:** Web, Google Play, Apple App Store`,
        `- **Orchestrated Sub-Agents:**`,
        `  1. Lumi (Alphabet A–Z & Tracing Coach)`,
        `  2. Pip (Numbers 1–10 & Counting Agent)`,
        `  3. Coco (Colors & Vocabulary Agent)`,
        `  4. Sunny Video Studio (Kid ASL Video Production Agent)`,
        ``,
        `## Subsequent Workflow Policy`,
        `1. Keep sessions playful for ages 5–8 (3–5 short lessons per cycle).`,
        `2. Pair every letter or number tracing exercise with an ASL handshape video or live kid-signing prompt.`,
        `3. Update each sub-agent RAG file whenever lessons or kid ASL videos are completed.`,
      ].join('\n'),
    },
    {
      id: 'alphabet-agent-rag',
      agentName: 'Lumi · Alphabet & Tracing Agent',
      agentRole: 'alphabet',
      version: 1,
      updatedAtIso: nowIso,
      chunks: [
        `Completed Letters (${alphaDone.length}/26): ${alphaDone.join(', ') || 'None yet'}.`,
        `Next Letters Queue: ${alphaPending.slice(0, 6).join(', ') || 'All 26 letters complete!'}.`,
        `A-E Verified Google Drive Videos: A, B, C, D, E are live and ready for mirror-signing practice.`,
        `Tracing Pedagogy: Encourage slow finger/stylus strokes following the dotted baseline before marking complete.`,
      ],
      markdownContent: [
        `# Alphabet & Tracing Agent RAG (Lumi)`,
        ``,
        `- **Completed (A–Z):** ${alphaDone.join(', ') || 'None yet'}`,
        `- **Remaining:** ${alphaPending.join(', ') || 'None'}`,
        ``,
        `## A–Z ASL Handshape & Word Pairs`,
        ...ALPHABET_LESSONS.map(
          (l) => `- **${l.letter} (${l.word})**: ${l.aslCue}`
        ),
      ].join('\n'),
    },
    {
      id: 'numbers-agent-rag',
      agentName: 'Pip · Numbers & Counting Agent',
      agentRole: 'numbers',
      version: 1,
      updatedAtIso: nowIso,
      chunks: [
        `Completed Numbers (${numDone.length}/10): ${numDone.join(', ') || 'None yet'}.`,
        `Remaining Numbers: ${numPending.join(', ') || 'All 10 numbers complete!'}.`,
        `ASL Palm Orientation Rule: Numbers 1-5 face palm inward toward the signer; 6-9 tap thumb to pinky/ring/middle/index.`,
        `Counting Reinforcement: Combine star counting objects with dotted numeral tracing.`,
      ],
      markdownContent: [
        `# Numbers & Counting Agent RAG (Pip)`,
        ``,
        `- **Completed (1–10):** ${numDone.join(', ') || 'None yet'}`,
        `- **Remaining:** ${numPending.join(', ') || 'None'}`,
        ``,
        `## 1–10 ASL Handshape Reference`,
        ...NUMBER_LESSONS.map((n) => `- **${n.digit} (${n.word})**: ${n.aslCue}`),
      ].join('\n'),
    },
    {
      id: 'colors-agent-rag',
      agentName: 'Coco · Colors & Vocabulary Agent',
      agentRole: 'colors',
      version: 1,
      updatedAtIso: nowIso,
      chunks: [
        `Completed Colors (${colorDone.length}/10): ${colorDone.join(', ') || 'None yet'}.`,
        `Remaining Colors: ${colorPending.join(', ') || 'All 10 colors complete!'}.`,
        `Multisensory Cue: Pair color swatches, spoken audio, real-world objects, and ASL facial/hand movement.`,
        `Mini-Challenge Goal: 4-choice visual color match after practicing the sign.`,
      ],
      markdownContent: [
        `# Colors & Vocabulary Agent RAG (Coco)`,
        ``,
        `- **Completed Colors:** ${colorDone.join(', ') || 'None yet'}`,
        `- **Remaining Colors:** ${colorPending.join(', ') || 'None'}`,
        ``,
        `## Color Sign Cues`,
        ...COLOR_LESSONS.map((c) => `- **${c.name} (${c.objectName})**: ${c.aslCue}`),
      ].join('\n'),
    },
    {
      id: 'video-studio-agent-rag',
      agentName: 'Sunny · ASL Video Production Agent',
      agentRole: 'video',
      version: 1,
      updatedAtIso: nowIso,
      chunks: [
        `Kid-Signer Clips Linked: ${kidVideos.length} total clips across A-Z, 1-10, and Colors.`,
        `Filming Priority 1: Capture kids signing letters F-Z in bright, uncluttered framing at eye level.`,
        `Filming Priority 2: Capture kids signing numbers 1-10 clearly showing palm-inward vs palm-outward orientation.`,
        `Verification Gate: Fluent ASL signer or Deaf mentor verifies every clip before App Store / Play Store release.`,
      ],
      markdownContent: [
        `# ASL Video Production Agent RAG (Sunny Video Studio)`,
        ``,
        `- **Verified Clips:** ${verifiedVideos.length} / ${videos.length}`,
        `- **Kid Signer Clips:** ${kidVideos.length}`,
        ``,
        `## Production Standards for Kid Signing Videos (A–Z & 1–10)`,
        `1. Plain, soft background with natural front lighting so handshapes stay crisp.`,
        `2. Frame from waist to above head so facial grammar and hand placement are both visible.`,
        `3. Hold each ASL sign clearly for 2–3 seconds and repeat once slowly.`,
        `4. Verify accuracy with a fluent ASL signer before toggling Verified status.`,
      ].join('\n'),
    },
  ];
}
