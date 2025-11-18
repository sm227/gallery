'use client';

import Image from 'next/image';
import { useState } from 'react';
import ImageModal from './ImageModal';

export interface ExifData {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  dateTaken?: string;
}

export interface ImageData {
  id: string;
  filename: string;
  title?: string;
  description?: string;
  date?: string;
  uploadedAt?: string;
  width?: number;
  height?: number;
  exif?: ExifData | null;
}

interface GalleryProps {
  images: ImageData[];
}

export default function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  // 업로드 시간의 내림차순으로 정렬 (최신이 먼저)
  const sortedImages = [...images].sort((a, b) => {
    const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return dateB - dateA;
  });

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
          아직 업로드된 사진이 없습니다
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {sortedImages.map((image) => (
          <div key={image.id}>
            <div
              className="relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden cursor-pointer group"
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={`/api/images/${image.filename}`}
                alt={image.title || image.filename}
                width={image.width || 800}
                height={image.height || 600}
                className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
            </div>

            {/* 간단한 메타 정보 */}
            {(image.exif?.camera || image.date) && (
              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {image.exif?.camera && <span>{image.exif.camera}</span>}
                {image.exif?.camera && image.date && <span> • </span>}
                {image.date && <span>{image.date}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}
