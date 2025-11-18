import Gallery from "@/components/Gallery";
import ThemeToggle from "@/components/ThemeToggle";
import { promises as fs } from "fs";
import path from "path";
import type { ImageData } from "@/components/Gallery";

async function getImages(): Promise<ImageData[]> {
  try {
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "images.json"
    );
    const fileContents = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  const images = await getImages();

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Code Pixel
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <Gallery images={images} />
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Gallery. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
