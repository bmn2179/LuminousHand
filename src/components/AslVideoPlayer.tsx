import React from 'react';
import { ExternalLink, Video } from 'lucide-react';
import { isDriveUrl, toDrivePreviewUrl } from '../data/curriculum';
import type { AslVideoEntry } from '../types/luminous';

interface AslVideoPlayerProps {
  video?: AslVideoEntry;
  aslCue: string;
  onOpenStudio?: () => void;
}

export const AslVideoPlayer: React.FC<AslVideoPlayerProps> = ({
  video,
  aslCue,
  onOpenStudio,
}) => {
  const previewSrc = video?.localPreviewUrl || toDrivePreviewUrl(video?.videoUrl || '');
  const isGoogleDrive = Boolean(video?.videoUrl && isDriveUrl(video.videoUrl));
  const isLocalOrMp4 = Boolean(video?.localPreviewUrl) || (Boolean(previewSrc) && !isGoogleDrive);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-[#B3D6D1] bg-gradient-to-br from-[#E6F7F4] to-[#FFF3D7] overflow-hidden min-h-[240px] flex flex-col items-center justify-center p-4 text-center">
        {previewSrc ? (
          isLocalOrMp4 ? (
            <video
              key={previewSrc}
              src={previewSrc}
              controls
              playsInline
              preload="metadata"
              aria-label={`ASL demonstration for ${video?.label}`}
              className="w-full max-h-[300px] rounded-xl bg-[#152A37]"
            />
          ) : (
            <div className="w-full space-y-2">
              <iframe
                key={previewSrc}
                src={previewSrc}
                title={`ASL demonstration for ${video?.label}`}
                loading="lazy"
                allow="autoplay; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-[270px] rounded-xl border-0 bg-[#152A37]"
              />
              {video?.videoUrl && (
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#078F89] underline"
                >
                  Open {video.label} video in Google Drive
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )
        ) : (
          <div className="max-w-sm space-y-3 py-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-white border-2 border-[#C5E7E2] flex items-center justify-center text-[#078F89]">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg text-[#24334F]">
                Kid-signing video slot ready
              </p>
              <p className="text-sm text-[#51617B] mt-1">
                No verified video linked for {video?.label || 'this sign'} yet. Record a kid signer or connect a Google Cloud Storage, www.luminoushand.com, or Google Drive clip in the Video Studio.
              </p>
            </div>
            {onOpenStudio && (
              <button
                type="button"
                onClick={onOpenStudio}
                className="inline-flex items-center gap-2 rounded-xl bg-[#078F89] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#067873] transition-colors cursor-pointer"
              >
                <Video className="w-4 h-4" />
                Record or Link ASL Video
              </button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-[#FFFAF0] border border-[#E4EAF4] px-4 py-3 text-sm text-[#24334F]">
        <span className="font-bold text-[#078F89]">ASL Handshape Guide: </span>
        <span>{aslCue}</span>
        {video?.signerName && (
          <span className="block mt-1 text-xs text-[#61718A]">
            Signer: {video.signerName} · {video.signerType === 'kid' ? 'Kid Signer' : video.signerType === 'deaf-mentor' ? 'Deaf Mentor' : 'Adult Signer'} · {video.verified ? 'Verified' : 'Pending Review'}
          </span>
        )}
      </div>
    </div>
  );
};
