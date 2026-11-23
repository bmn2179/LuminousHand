import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Cloud,
  Download,
  FileJson,
  Link2,
  Square,
  Upload,
  Video,
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  ALPHABET_LESSONS,
  COLOR_LESSONS,
  NUMBER_LESSONS,
} from '../data/curriculum';
import type { AslVideoEntry, LessonCategory } from '../types/luminous';
import { saveVideoBlob } from '../utils/localVideoStore';
import { AslVideoPlayer } from './AslVideoPlayer';
import { SunnyCharacter } from './Characters';

interface VideoStudioViewProps {
  videos: AslVideoEntry[];
  onSaveVideo: (entry: AslVideoEntry) => Promise<void> | void;
}

function matchLessonIdFromToken(token: string): string | null {
  const clean = token.trim().toUpperCase();
  if (/^[A-Z]$/.test(clean)) {
    const found = ALPHABET_LESSONS.find((l) => l.letter === clean);
    return found ? found.id : null;
  }
  const numMatch = clean.match(/^(?:NUMBER\s*)?(10|[1-9])$/);
  if (numMatch) {
    const found = NUMBER_LESSONS.find((n) => String(n.digit) === numMatch[1]);
    return found ? found.id : null;
  }
  const lower = token.trim().toLowerCase();
  const colorFound = COLOR_LESSONS.find((c) => c.name.toLowerCase() === lower);
  return colorFound ? colorFound.id : null;
}

export const VideoStudioView: React.FC<VideoStudioViewProps> = ({
  videos,
  onSaveVideo,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | LessonCategory>('all');
  const [selectedId, setSelectedId] = useState<string>('letter-F');

  const selectedEntry = videos.find((v) => v.id === selectedId) ?? videos[0];

  const [videoUrlInput, setVideoUrlInput] = useState(selectedEntry?.videoUrl || '');
  const [signerNameInput, setSignerNameInput] = useState(
    selectedEntry?.signerName || 'Kid Signer'
  );
  const [signerTypeInput, setSignerTypeInput] = useState<'kid' | 'adult' | 'deaf-mentor'>(
    selectedEntry?.signerType || 'kid'
  );
  const [verifiedInput, setVerifiedInput] = useState<boolean>(
    Boolean(selectedEntry?.verified)
  );
  const [saveMessage, setSaveMessage] = useState('');

  // Webcam recording & file upload state
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string>('');
  const [cameraError, setCameraError] = useState('');

  // Free Google Drive Bulk Importer (zero Cloud Billing required)
  const [bulkDriveText, setBulkDriveText] = useState('');
  const [bulkStatusMsg, setBulkStatusMsg] = useState('');
  const [isBulkImporting, setIsBulkImporting] = useState(false);

  useEffect(() => {
    if (selectedEntry) {
      setVideoUrlInput(selectedEntry.videoUrl);
      setSignerNameInput(selectedEntry.signerName || 'Kid Signer');
      setSignerTypeInput(selectedEntry.signerType || 'kid');
      setVerifiedInput(Boolean(selectedEntry.verified));
      setSaveMessage('');
    }
  }, [selectedId, selectedEntry]);

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const filteredVideos = videos.filter((v) =>
    filterCategory === 'all' ? true : v.category === filterCategory
  );

  const alphaVideos = videos.filter((v) => v.category === 'alphabet');
  const numVideos = videos.filter((v) => v.category === 'numbers');
  const colorVideos = videos.filter((v) => v.category === 'colors');

  const readyAlpha = alphaVideos.filter((v) => v.videoUrl || v.localPreviewUrl).length;
  const readyNum = numVideos.filter((v) => v.videoUrl || v.localPreviewUrl).length;
  const readyColor = colorVideos.filter((v) => v.videoUrl || v.localPreviewUrl).length;
  const verifiedTotal = videos.filter((v) => v.verified && v.videoUrl).length;

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera recording is unavailable in this browser context.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 540 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      setCameraActive(true);
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError(
        'Camera access was denied or no camera was detected. You can still upload a video file or paste free Google Drive links below.'
      );
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
    setIsRecording(false);
  };

  const startRecording = () => {
    if (!mediaStreamRef.current) return;
    chunksRef.current = [];
    try {
      const recorder = new MediaRecorder(mediaStreamRef.current);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        recordedBlobRef.current = blob;
        const blobUrl = URL.createObjectURL(blob);
        setRecordedBlobUrl(blobUrl);
        setIsRecording(false);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setCameraError('Unable to start MediaRecorder in this browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const attachRecordedClipToSelected = async () => {
    if (!selectedEntry || !recordedBlobUrl) return;
    if (recordedBlobRef.current) {
      await saveVideoBlob(selectedEntry.id, recordedBlobRef.current);
    }
    await onSaveVideo({
      ...selectedEntry,
      signerName: signerNameInput.trim() || 'Kid Signer',
      signerType: signerTypeInput,
      verified: verifiedInput,
      localPreviewUrl: recordedBlobUrl,
    });
    setSaveMessage(
      `Saved clip for ${selectedEntry.label} in browser storage (persists across refreshes) and attached to the Learning Lab!`
    );
  };

  const handleUploadVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEntry) return;
    const blobUrl = URL.createObjectURL(file);
    await saveVideoBlob(selectedEntry.id, file);
    await onSaveVideo({
      ...selectedEntry,
      signerName: signerNameInput.trim() || 'Kid Signer',
      signerType: signerTypeInput,
      verified: verifiedInput,
      localPreviewUrl: blobUrl,
    });
    setSaveMessage(
      `Uploaded "${file.name}" for ${selectedEntry.label} and saved to persistent browser storage (no Cloud Billing required).`
    );
    e.target.value = '';
  };

  const handleBulkImportDriveLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkDriveText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    setIsBulkImporting(true);
    setBulkStatusMsg('');
    let matchedCount = 0;

    try {
      for (const line of lines) {
        const match = line.match(/^([A-Za-z0-9]+)\s*[:=\-\s]\s*(https?:\/\/\S+)$/);
        if (!match) continue;
        const lessonId = matchLessonIdFromToken(match[1]);
        const url = match[2];
        if (!lessonId) continue;
        const target = videos.find((v) => v.id === lessonId);
        if (!target) continue;

        await onSaveVideo({
          ...target,
          videoUrl: url,
          signerName: target.signerName || 'Luminous Hand Kid Signer',
          signerType: target.signerType || 'kid',
          verified: true,
        });
        matchedCount += 1;
      }

      setBulkStatusMsg(
        matchedCount > 0
          ? `Connected ${matchedCount} free Google Drive ASL video link(s) and saved them to your account!`
          : 'No lines matched. Format each line as "F: https://drive.google.com/file/d/.../view" or "1: https://drive.google.com/file/d/.../view".'
      );
    } finally {
      setIsBulkImporting(false);
    }
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;
    await onSaveVideo({
      ...selectedEntry,
      videoUrl: videoUrlInput.trim(),
      signerName: signerNameInput.trim() || 'Kid Signer',
      signerType: signerTypeInput,
      verified: verifiedInput,
      localPreviewUrl: recordedBlobUrl || selectedEntry.localPreviewUrl,
    });
    setSaveMessage(`Saved ASL video metadata for ${selectedEntry.label}.`);
  };

  const exportCatalogJson = () => {
    const cleanList = videos.map(({ localPreviewUrl: _omit, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(cleanList, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'luminous-hand-asl-video-catalog.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header & Production Progress */}
      <section className="rounded-[28px] border-2 border-[#B3E4DE] bg-gradient-to-br from-[#EAF9F6] to-[#FFF9EB] p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SunnyCharacter className="w-16 h-16 shrink-0" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#078F89]">
                Sunny’s Kid ASL Video Production Studio
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24334F]">
                Create &amp; Verify Kid-Signing ASL Videos (A–Z &amp; 1–10)
              </h1>
              <p className="text-sm text-[#51617B] mt-1">
                Zero-billing setup: record kid signers via webcam, upload .mp4/.webm clips directly,
                or link free Google Drive videos just like A–E.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={exportCatalogJson}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[#C5E7E2] bg-white px-4 py-2.5 text-sm font-bold text-[#078F89] hover:bg-[#EDFBF9] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileJson className="w-4 h-4" />
            Export Video Catalog JSON
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-2xl bg-white border border-[#DCE5F2] p-3.5">
            <p className="text-xs font-bold text-[#51617B]">Alphabet A–Z</p>
            <p className="text-2xl font-extrabold text-[#FF9800] tabular-nums">
              {readyAlpha} / {alphaVideos.length}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-[#DCE5F2] p-3.5">
            <p className="text-xs font-bold text-[#51617B]">Numbers 1–10</p>
            <p className="text-2xl font-extrabold text-[#078F89] tabular-nums">
              {readyNum} / {numVideos.length}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-[#DCE5F2] p-3.5">
            <p className="text-xs font-bold text-[#51617B]">Colors</p>
            <p className="text-2xl font-extrabold text-[#438CE4] tabular-nums">
              {readyColor} / {colorVideos.length}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-[#DCE5F2] p-3.5">
            <p className="text-xs font-bold text-[#51617B]">Verified Sign Clips</p>
            <p className="text-2xl font-extrabold text-[#24334F] tabular-nums">
              {verifiedTotal} / {videos.length}
            </p>
          </div>
        </div>
      </section>

      {/* Free Google Drive & Zero-Billing Cloud Connector */}
      <section className="rounded-3xl border-2 border-[#C2DAFA] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#EDF4FE] border border-[#C2DAFA] flex items-center justify-center text-[#2E6BB8] shrink-0">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#24334F]">
              GitHub Pages + www.luminoushand.com &amp; Free Google Drive Setup
            </h2>
            <p className="text-xs text-[#51617B]">
              Custom Domain (<code className="font-mono">public/CNAME</code>): <span className="font-mono font-semibold text-[#24334F]">www.luminoushand.com</span> ·
              Firebase Project: <span className="font-mono font-semibold text-[#24334F]">{firebaseConfig.projectId}</span> ·
              Firestore DB: <span className="font-mono font-semibold text-[#24334F]">{firebaseConfig.firestoreDatabaseId}</span>
            </p>
            <p className="text-xs text-[#51617B] mt-1">
              Hosted free on GitHub Pages with zero billing: host your A–Z and 1–10 clips on Google
              Drive (just like A–E), put <code className="font-mono">.mp4</code> files in <code className="font-mono">public/videos/</code>,
              or record/upload clips directly into browser storage.
            </p>
          </div>
        </div>

        <form onSubmit={handleBulkImportDriveLinks} className="space-y-3">
          <label className="block space-y-1.5">
            <span className="block text-xs font-bold text-[#51617B]">
              Bulk-Connect Free Google Drive Links (one per line, e.g. <code className="font-mono">F: https://drive.google.com/file/d/.../view</code> or <code className="font-mono">1: https://drive.google.com/file/d/.../view</code>)
            </span>
            <textarea
              rows={3}
              value={bulkDriveText}
              onChange={(e) => setBulkDriveText(e.target.value)}
              placeholder={`F: https://drive.google.com/file/d/YOUR_FILE_ID/view\nG: https://drive.google.com/file/d/YOUR_FILE_ID/view\n1: https://drive.google.com/file/d/YOUR_FILE_ID/view`}
              className="w-full rounded-xl border-2 border-[#DCE5F2] bg-[#FFFAF0] p-3 text-xs font-mono text-[#24334F] focus:border-[#438CE4] focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isBulkImporting}
              className="rounded-xl bg-[#438CE4] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#3178D1] disabled:opacity-60 whitespace-nowrap cursor-pointer"
            >
              {isBulkImporting ? 'Connecting Drive Links...' : 'Connect Free Google Drive Links'}
            </button>
            {bulkStatusMsg && (
              <p className="text-xs font-bold text-[#078F89]">{bulkStatusMsg}</p>
            )}
          </div>
        </form>
      </section>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sign Selector Grid */}
        <div className="lg:col-span-5 rounded-3xl border-2 border-[#E3EAF4] bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold text-[#24334F]">Select Sign Slot</h2>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'alphabet', 'numbers', 'colors'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-[#24334F] text-white'
                      : 'bg-[#F2F6FC] text-[#51617B] hover:bg-[#E4ECF7]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredVideos.map((entry) => {
              const isSelected = entry.id === selectedId;
              const hasClip = Boolean(entry.videoUrl || entry.localPreviewUrl);
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedId(entry.id)}
                  className={`rounded-xl border-2 p-2.5 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#078F89] bg-[#EAF8F6]'
                      : hasClip
                        ? 'border-[#B3E4DE] bg-[#F8FEFD]'
                        : 'border-[#DCE5F2] bg-[#FFFAF0] hover:border-[#FF9800]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-[#24334F] truncate">
                      {entry.label}
                    </span>
                    {entry.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#078F89] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#61718A] mt-0.5 truncate">
                    {hasClip ? entry.signerType : 'Needs clip'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Webcam Studio, Upload & Metadata Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Webcam Recorder + Direct File Upload */}
          <div className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-[#24334F]">
                  Record or Upload Clip · {selectedEntry?.label}
                </h2>
                <p className="text-xs text-[#51617B]">
                  Clips recorded or uploaded here persist in your browser with zero Cloud Billing,
                  and can be downloaded anytime to drop into Google Drive.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 rounded-xl border-2 border-[#FFD98A] bg-[#FFF8E6] px-4 py-2.5 text-sm font-bold text-[#9A5E00] hover:bg-[#FFF0CC] cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload .mp4/.webm
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleUploadVideoFile}
                    className="hidden"
                  />
                </label>

                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#078F89] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#067873] cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Open Camera
                  </button>
                ) : (
                  <>
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#E84142] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#CC3334] cursor-pointer"
                      >
                        <Video className="w-4 h-4" />
                        Start Recording
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#24334F] px-4 py-2.5 text-sm font-bold text-white cursor-pointer"
                      >
                        <Square className="w-4 h-4" />
                        Stop Recording
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="rounded-xl border-2 border-[#DCE5F2] bg-white px-3 py-2 text-xs font-bold text-[#51617B] cursor-pointer"
                    >
                      Close Camera
                    </button>
                  </>
                )}
              </div>
            </div>

            {cameraError && (
              <p className="rounded-xl border border-[#FFD699] bg-[#FFF5DF] px-4 py-2.5 text-xs font-semibold text-[#9A5E00]">
                {cameraError}
              </p>
            )}

            {cameraActive && (
              <video
                ref={previewVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full max-h-[260px] rounded-2xl bg-[#152A37] object-cover"
              />
            )}

            {recordedBlobUrl && (
              <div className="rounded-2xl border-2 border-[#B3E4DE] bg-[#F5FCFB] p-4 space-y-3">
                <p className="text-xs font-extrabold text-[#078F89]">
                  Recorded Take Ready
                </p>
                <video
                  src={recordedBlobUrl}
                  controls
                  playsInline
                  className="w-full max-h-[220px] rounded-xl bg-[#152A37]"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={attachRecordedClipToSelected}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF9800] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#E78900] cursor-pointer"
                  >
                    Save to {selectedEntry?.label} Lab
                  </button>
                  <a
                    href={recordedBlobUrl}
                    download={`luminous-hand-${selectedEntry?.id || 'clip'}.webm`}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-[#C5E7E2] bg-white px-4 py-2.5 text-sm font-bold text-[#078F89] hover:bg-[#EDFBF9]"
                  >
                    <Download className="w-4 h-4" />
                    Download .webm Clip
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Link Single Google Drive / HTTPS URL + Verification */}
          <form
            onSubmit={handleSaveMetadata}
            className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-4"
          >
            <h3 className="text-lg font-extrabold text-[#24334F] flex items-center gap-2">
              <Link2 className="w-5 h-5 text-[#438CE4]" />
              Link Google Drive or HTTPS Video &amp; Verify ASL Accuracy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-1.5 sm:col-span-2">
                <span className="block text-xs font-bold text-[#51617B]">
                  Google Drive Share Link or HTTPS MP4 URL
                </span>
                <input
                  type="text"
                  maxLength={500}
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full rounded-xl border-2 border-[#DCE5F2] bg-[#FFFAF0] px-3.5 py-2.5 text-sm font-semibold text-[#24334F] focus:border-[#078F89] focus:outline-none"
                />
              </label>

              <label className="space-y-1.5">
                <span className="block text-xs font-bold text-[#51617B]">Signer Name</span>
                <input
                  type="text"
                  maxLength={60}
                  value={signerNameInput}
                  onChange={(e) => setSignerNameInput(e.target.value)}
                  placeholder="e.g., Maya (Age 7)"
                  className="w-full rounded-xl border-2 border-[#DCE5F2] bg-[#FFFAF0] px-3.5 py-2.5 text-sm font-semibold text-[#24334F] focus:border-[#078F89] focus:outline-none"
                />
              </label>

              <label className="space-y-1.5">
                <span className="block text-xs font-bold text-[#51617B]">Signer Role</span>
                <select
                  value={signerTypeInput}
                  onChange={(e) =>
                    setSignerTypeInput(e.target.value as 'kid' | 'adult' | 'deaf-mentor')
                  }
                  className="w-full rounded-xl border-2 border-[#DCE5F2] bg-[#FFFAF0] px-3.5 py-2.5 text-sm font-semibold text-[#24334F] focus:border-[#078F89] focus:outline-none"
                >
                  <option value="kid">Kid Signer</option>
                  <option value="deaf-mentor">Deaf Mentor</option>
                  <option value="adult">Adult Educator / Parent</option>
                </select>
              </label>
            </div>

            <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedInput}
                onChange={(e) => setVerifiedInput(e.target.checked)}
                className="w-4 h-4 accent-[#078F89]"
              />
              <span className="text-sm font-bold text-[#24334F]">
                Verified by fluent ASL signer for Web, Google Play &amp; Apple App Store release
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                className="rounded-xl bg-[#24334F] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#19243A] transition-colors cursor-pointer"
              >
                Save Video Entry for {selectedEntry?.label}
              </button>
              {saveMessage && (
                <p className="text-xs font-bold text-[#078F89]">{saveMessage}</p>
              )}
            </div>
          </form>

          {selectedEntry && (
            <div className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#51617B]">
                Live Preview · {selectedEntry.label}
              </h3>
              <AslVideoPlayer
                video={selectedEntry}
                aslCue={`Live preview for ${selectedEntry.label}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
