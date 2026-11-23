import type {
  AlphabetLesson,
  AslVideoEntry,
  ColorLesson,
  NumberLesson,
} from '../types/luminous';

export const ALPHABET_LESSONS: AlphabetLesson[] = [
  { id: 'letter-A', letter: 'A', word: 'Apple', emoji: '🍎', aslCue: 'Closed fist with thumb resting upright beside the index finger.', driveFileId: '15oh11tBHdPaSmu5Gr-8ckPIGo-r-7XGY' },
  { id: 'letter-B', letter: 'B', word: 'Ball', emoji: '⚽', aslCue: 'Four fingers straight together pointing up, thumb tucked across the palm.', driveFileId: '1Qc3lAaJzpoS3-PkcXbFHTgMCF74MwQWd' },
  { id: 'letter-C', letter: 'C', word: 'Cat', emoji: '🐱', aslCue: 'Curve all four fingers and thumb into a bright C crescent.', driveFileId: '1XOA8ImSCC5FgcxEtWcgvFj6ZIk5NR3u0' },
  { id: 'letter-D', letter: 'D', word: 'Dog', emoji: '🐶', aslCue: 'Point index finger straight up while thumb touches middle, ring, and pinky tips.', driveFileId: '1aktzfUKYzmNKp2UcSTJ3ysWLrJAUMaa1' },
  { id: 'letter-E', letter: 'E', word: 'Elephant', emoji: '🐘', aslCue: 'Bend all four fingertips gently down onto the tucked thumb.', driveFileId: '1Kj_9_DICFaT6Y9nB2EKufoxh13wHr_zK' },
  { id: 'letter-F', letter: 'F', word: 'Fish', emoji: '🐠', aslCue: 'Touch thumb and index fingertips into a circle; raise middle, ring, and pinky.' },
  { id: 'letter-G', letter: 'G', word: 'Giraffe', emoji: '🦒', aslCue: 'Point index finger and thumb sideways parallel to each other.' },
  { id: 'letter-H', letter: 'H', word: 'Hat', emoji: '👒', aslCue: 'Extend index and middle fingers sideways together; curl other fingers.' },
  { id: 'letter-I', letter: 'I', word: 'Igloo', emoji: '🧊', aslCue: 'Make a gentle fist and raise only the pinky finger straight up.' },
  { id: 'letter-J', letter: 'J', word: 'Jump', emoji: '🦘', aslCue: 'Start with the I pinky upright and trace a smooth J curve in the air.' },
  { id: 'letter-K', letter: 'K', word: 'Kite', emoji: '🪁', aslCue: 'Index up, middle angled forward, and thumb resting between them.' },
  { id: 'letter-L', letter: 'L', word: 'Lion', emoji: '🦁', aslCue: 'Extend thumb sideways and index finger straight up to form an L.' },
  { id: 'letter-M', letter: 'M', word: 'Moon', emoji: '🌙', aslCue: 'Tuck thumb under index, middle, and ring fingers resting over it.' },
  { id: 'letter-N', letter: 'N', word: 'Nest', emoji: '🪺', aslCue: 'Tuck thumb under index and middle fingers resting gently forward.' },
  { id: 'letter-O', letter: 'O', word: 'Octopus', emoji: '🐙', aslCue: 'Curve all fingertips to meet the thumb tip in a smooth round O.' },
  { id: 'letter-P', letter: 'P', word: 'Penguin', emoji: '🐧', aslCue: 'Same K handshape tilted gently downward from the wrist.' },
  { id: 'letter-Q', letter: 'Q', word: 'Queen', emoji: '👑', aslCue: 'Same G handshape pointed downward toward the floor.' },
  { id: 'letter-R', letter: 'R', word: 'Rainbow', emoji: '🌈', aslCue: 'Cross middle finger cleanly over the upright index finger.' },
  { id: 'letter-S', letter: 'S', word: 'Sun', emoji: '☀️', aslCue: 'Make a firm fist with the thumb wrapped across the front of the fingers.' },
  { id: 'letter-T', letter: 'T', word: 'Turtle', emoji: '🐢', aslCue: 'Tuck thumb snugly between the index and middle fingers.' },
  { id: 'letter-U', letter: 'U', word: 'Umbrella', emoji: '☂️', aslCue: 'Hold index and middle fingers upright pressed together.' },
  { id: 'letter-V', letter: 'V', word: 'Violin', emoji: '🎻', aslCue: 'Hold index and middle fingers upright apart in a V shape.' },
  { id: 'letter-W', letter: 'W', word: 'Whale', emoji: '🐋', aslCue: 'Raise index, middle, and ring fingers spread into a W; thumb holds pinky.' },
  { id: 'letter-X', letter: 'X', word: 'Xylophone', emoji: '🎶', aslCue: 'Curl the index finger into a little hook while other fingers stay closed.' },
  { id: 'letter-Y', letter: 'Y', word: 'Yo-yo', emoji: '🪀', aslCue: 'Extend thumb and pinky outward while curling the middle three fingers.' },
  { id: 'letter-Z', letter: 'Z', word: 'Zebra', emoji: '🦓', aslCue: 'Point index finger and draw a zig-zag Z in the air.' },
];

export const NUMBER_LESSONS: NumberLesson[] = [
  { id: 'number-1', digit: 1, word: 'One', aslCue: 'Hold index finger straight up, palm facing inward.' },
  { id: 'number-2', digit: 2, word: 'Two', aslCue: 'Raise index and middle fingers apart, palm facing inward.' },
  { id: 'number-3', digit: 3, word: 'Three', aslCue: 'Extend thumb, index, and middle fingers upright.' },
  { id: 'number-4', digit: 4, word: 'Four', aslCue: 'Hold four fingers straight up with thumb tucked across palm.' },
  { id: 'number-5', digit: 5, word: 'Five', aslCue: 'Spread all five fingers wide open like a bright star.' },
  { id: 'number-6', digit: 6, word: 'Six', aslCue: 'Touch thumb tip to pinky tip; raise index, middle, and ring fingers.' },
  { id: 'number-7', digit: 7, word: 'Seven', aslCue: 'Touch thumb tip to ring fingertip; keep other three fingers up.' },
  { id: 'number-8', digit: 8, word: 'Eight', aslCue: 'Touch thumb tip to middle fingertip; keep other three fingers up.' },
  { id: 'number-9', digit: 9, word: 'Nine', aslCue: 'Touch thumb tip to index fingertip; raise middle, ring, and pinky.' },
  { id: 'number-10', digit: 10, word: 'Ten', aslCue: 'Make a thumbs-up handshape and give the wrist a gentle wiggle.' },
];

export const COLOR_LESSONS: ColorLesson[] = [
  { id: 'color-red', name: 'Red', hex: '#E84142', textLight: true, emoji: '🍎', objectName: 'Apple', aslCue: 'Brush index fingertip downward twice gently below the bottom lip.' },
  { id: 'color-blue', name: 'Blue', hex: '#2877DA', textLight: true, emoji: '🫐', objectName: 'Blueberries', aslCue: 'Form the B handshape and twist the wrist lightly side to side.' },
  { id: 'color-yellow', name: 'Yellow', hex: '#F7C948', textLight: false, emoji: '🌻', objectName: 'Sunflower', aslCue: 'Form the Y handshape and twist the wrist smoothly twice.' },
  { id: 'color-green', name: 'Green', hex: '#36A66B', textLight: true, emoji: '🐸', objectName: 'Frog', aslCue: 'Form the G handshape and twist the wrist lightly forward.' },
  { id: 'color-orange', name: 'Orange', hex: '#F28A30', textLight: false, emoji: '🍊', objectName: 'Orange', aslCue: 'Hold a C/S fist under the chin and squeeze twice like juicing an orange.' },
  { id: 'color-purple', name: 'Purple', hex: '#8956C7', textLight: true, emoji: '🍇', objectName: 'Grapes', aslCue: 'Form the P handshape and shake lightly side to side.' },
  { id: 'color-pink', name: 'Pink', hex: '#EF8DB6', textLight: false, emoji: '🌸', objectName: 'Flower', aslCue: 'Brush the middle fingertip of a P handshape downward across the lower lip.' },
  { id: 'color-brown', name: 'Brown', hex: '#91633F', textLight: true, emoji: '🐻', objectName: 'Bear', aslCue: 'Slide the index side of a B handshape downward along your cheek.' },
  { id: 'color-black', name: 'Black', hex: '#252B38', textLight: true, emoji: '🐈‍⬛', objectName: 'Black Cat', aslCue: 'Draw index finger cleanly across the forehead from side to side.' },
  { id: 'color-white', name: 'White', hex: '#FFFFFF', textLight: false, emoji: '☁️', objectName: 'Cloud', aslCue: 'Place open five fingers on chest and pull outward closing tips together.' },
];

export const TOTAL_LESSON_COUNT =
  ALPHABET_LESSONS.length + NUMBER_LESSONS.length + COLOR_LESSONS.length;

export function buildDefaultVideoCatalog(): AslVideoEntry[] {
  const alphaVideos: AslVideoEntry[] = ALPHABET_LESSONS.map((item) => ({
    id: item.id,
    lessonId: item.id,
    category: 'alphabet',
    label: `Letter ${item.letter}`,
    videoUrl: item.driveFileId
      ? `https://drive.google.com/file/d/${item.driveFileId}/view`
      : '',
    signerName: item.driveFileId ? 'Luminous Hand Signer' : '',
    signerType: 'kid',
    verified: Boolean(item.driveFileId),
  }));

  const numberVideos: AslVideoEntry[] = NUMBER_LESSONS.map((item) => ({
    id: item.id,
    lessonId: item.id,
    category: 'numbers',
    label: `Number ${item.digit}`,
    videoUrl: '',
    signerName: '',
    signerType: 'kid',
    verified: false,
  }));

  const colorVideos: AslVideoEntry[] = COLOR_LESSONS.map((item) => ({
    id: item.id,
    lessonId: item.id,
    category: 'colors',
    label: `Color ${item.name}`,
    videoUrl: '',
    signerName: '',
    signerType: 'kid',
    verified: false,
  }));

  return [...alphaVideos, ...numberVideos, ...colorVideos];
}

export function normalizeCloudMediaUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('gs://')) {
    const withoutScheme = trimmed.slice(5).replace(/^\/+/, '');
    const slashIdx = withoutScheme.indexOf('/');
    if (slashIdx <= 0) return '';
    const bucket = withoutScheme.slice(0, slashIdx);
    const objectPath = withoutScheme.slice(slashIdx + 1);
    return `https://storage.googleapis.com/${bucket}/${objectPath}`;
  }
  return trimmed;
}

export function toDrivePreviewUrl(rawUrl: string): string {
  const normalized = normalizeCloudMediaUrl(rawUrl);
  if (!normalized) return '';
  if (normalized.startsWith('/')) return normalized;
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
    if (parsed.hostname === 'drive.google.com') {
      const match =
        parsed.pathname.match(/\/file\/d\/([\w-]+)/) ||
        parsed.pathname.match(/\/d\/([\w-]+)/);
      const id = match?.[1] || parsed.searchParams.get('id');
      if (id && /^[\w-]+$/.test(id)) {
        return `https://drive.google.com/file/d/${id}/preview`;
      }
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

export function isDriveUrl(url: string): boolean {
  try {
    return new URL(url).hostname === 'drive.google.com';
  } catch {
    return false;
  }
}

export function buildDefaultVideoFilename(lessonId: string): string {
  if (lessonId.startsWith('letter-')) {
    return `ASL_Letter_${lessonId.replace('letter-', '').toUpperCase()}.mp4`;
  }
  if (lessonId.startsWith('number-')) {
    return `ASL_Number_${lessonId.replace('number-', '')}.mp4`;
  }
  if (lessonId.startsWith('color-')) {
    return `ASL_Color_${lessonId.replace('color-', '').toLowerCase()}.mp4`;
  }
  return `${lessonId}.mp4`;
}

export function buildCloudVideoUrl(baseUrl: string, lessonId: string): string {
  const cleanBase = normalizeCloudMediaUrl(baseUrl).replace(/\/+$/, '');
  if (!cleanBase) return '';
  return `${cleanBase}/${buildDefaultVideoFilename(lessonId)}`;
}

