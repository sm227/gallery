'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import type { ImageData } from './Gallery';

interface ImageModalProps {
  image: ImageData;
  onClose: () => void;
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const hasExif = image.exif && Object.values(image.exif).some(v => v);

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      onClick={onClose}
    >
      {/* 상단 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={onClose}
            className="text-white/90 hover:text-white transition-colors"
            aria-label="닫기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 이미지 */}
      <div
        className="relative w-full h-full flex items-start md:items-center justify-center pt-16 md:pt-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-[70vh] md:h-full md:max-h-[85vh]">
          <Image
            src={`/gallery/${image.filename}`}
            alt={image.title || image.filename}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
      </div>

      {/* 하단 정보 */}
      {(image.title || image.description || image.date || hasExif) && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/70 to-transparent pb-safe">
          <div className="px-5 py-5 space-y-2.5">
            {image.title && (
              <h2 className="text-white text-base font-normal">{image.title}</h2>
            )}
            {image.description && (
              <p className="text-white/70 text-sm leading-relaxed">{image.description}</p>
            )}

            {hasExif && (
              <div className="space-y-1.5 text-white/60 text-xs">
                {image.exif?.camera && (
                  <div className="break-words">{image.exif.camera}</div>
                )}
                {image.exif?.lens && (
                  <div className="break-words">{image.exif.lens}</div>
                )}
                {(image.exif?.focalLength || image.exif?.aperture || image.exif?.shutterSpeed || image.exif?.iso) && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-white/50 pt-0.5">
                    {image.exif?.focalLength && <span className="whitespace-nowrap">{image.exif.focalLength}</span>}
                    {image.exif?.aperture && <span className="whitespace-nowrap">{image.exif.aperture}</span>}
                    {image.exif?.shutterSpeed && <span className="whitespace-nowrap">{image.exif.shutterSpeed}</span>}
                    {image.exif?.iso && <span className="whitespace-nowrap">{image.exif.iso}</span>}
                  </div>
                )}
              </div>
            )}

            {image.date && (
              <div className="text-white/40 text-xs pt-0.5">{image.date}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
