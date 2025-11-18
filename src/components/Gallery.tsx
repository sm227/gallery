'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
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
  width?: number;
  height?: number;
  exif?: ExifData | null;
}

interface GalleryProps {
  images: ImageData[];
}

export default function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [columns, setColumns] = useState<ImageData[][]>([[], [], []]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;
      const columnCount = width < 640 ? 1 : width < 1024 ? 2 : 3;

      const newColumns: ImageData[][] = Array.from({ length: columnCount }, () => []);
      const columnHeights = new Array(columnCount).fill(0);

      images.forEach((image) => {
        // 가장 짧은 컬럼 찾기
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
        newColumns[shortestColumnIndex].push(image);

        // 이미지 비율로 높이 계산
        const aspectRatio = (image.height || 600) / (image.width || 800);
        columnHeights[shortestColumnIndex] += aspectRatio;
      });

      setColumns(newColumns);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [images]);

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
      <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-4 md:gap-6">
            {column.map((image) => (
              <div
                key={image.id}
                className="group relative cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden">
                  <Image
                    src={`/gallery/${image.filename}`}
                    alt={image.title || image.filename}
                    width={image.width || 800}
                    height={image.height || 600}
                    className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  {image.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-white font-medium">{image.title}</h3>
                      {image.date && (
                        <p className="text-white/80 text-sm">{image.date}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
