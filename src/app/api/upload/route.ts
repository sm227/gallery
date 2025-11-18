import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import exifr from 'exifr';

// 업로드 비밀번호 (환경변수로 설정)
const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD || 'your-secret-password';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const password = formData.get('password') as string;
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;

    // 비밀번호 확인
    if (password !== UPLOAD_PASSWORD) {
      return NextResponse.json(
        { error: '비밀번호가 일치하지 않습니다' },
        { status: 401 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다' },
        { status: 400 }
      );
    }

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split('.').pop();
    const filename = `${uuidv4()}.${fileExtension}`;
    const filepath = path.join(process.cwd(), 'public', 'gallery', filename);

    await writeFile(filepath, buffer);

    // 이미지 크기 가져오기
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // EXIF 데이터 추출
    let exifData = null;
    try {
      const exif = await exifr.parse(buffer, {
        tiff: true,
        exif: true,
        gps: false,
      });

      if (exif) {
        exifData = {
          camera: exif.Make && exif.Model ? `${exif.Make} ${exif.Model}` : undefined,
          lens: exif.LensModel || undefined,
          focalLength: exif.FocalLength ? `${Math.round(exif.FocalLength)}mm` : undefined,
          aperture: exif.FNumber ? `f/${Math.round(exif.FNumber * 10) / 10}` : undefined,
          shutterSpeed: exif.ExposureTime
            ? exif.ExposureTime >= 1
              ? `${exif.ExposureTime}s`
              : `1/${Math.round(1 / exif.ExposureTime)}s`
            : undefined,
          iso: exif.ISO ? `ISO ${exif.ISO}` : undefined,
          dateTaken: exif.DateTimeOriginal || undefined,
        };
      }
    } catch (error) {
      console.log('EXIF extraction failed, continuing without EXIF data');
    }

    // 메타데이터 업데이트
    const jsonPath = path.join(process.cwd(), 'public', 'gallery', 'images.json');
    let images = [];

    try {
      const jsonContent = await readFile(jsonPath, 'utf8');
      images = JSON.parse(jsonContent);
    } catch (error) {
      // 파일이 없으면 빈 배열로 시작
    }

    images.unshift({
      id: uuidv4(),
      filename,
      title: title || undefined,
      description: description || undefined,
      date: date || new Date().toISOString().split('T')[0],
      width,
      height,
      exif: exifData,
    });

    await writeFile(jsonPath, JSON.stringify(images, null, 2));

    return NextResponse.json({
      success: true,
      filename,
      message: '업로드 완료'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '업로드 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
