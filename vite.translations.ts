import fs from 'fs';
import path from 'path';
import { PluginOption } from 'vite';

export default function vitePluginTranslations(): PluginOption {
  return {
    name: 'vite-plugin-translations',
    apply: 'build',
    async closeBundle() {
      const srcDir = path.resolve(__dirname, 'src/data/translations');
      // If the source directory doesn't exist, skip copying gracefully
      if (!fs.existsSync(srcDir)) {
        console.warn('[vite-plugin-translations] Source directory not found:', srcDir);
        console.warn('[vite-plugin-translations] Skipping translation copy step.');
        return;
      }
      // Copy to both public/translations and dist/translations to ensure compatibility
      const destDirs = [
        path.resolve(__dirname, 'public/translations'),
        path.resolve(__dirname, 'dist/translations')
      ];
      
      // Process each destination directory
      for (const destDir of destDirs) {
        try {
          // Create the destination directory if it doesn't exist
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          
          // Copy all JSON files from source directory
          const files = fs.readdirSync(srcDir);
          let copiedCount = 0;
          
          for (const file of files) {
            if (file.endsWith('.json')) {
              const srcPath = path.join(srcDir, file);
              const destPath = path.join(destDir, file);
              fs.copyFileSync(srcPath, destPath);
              copiedCount++;
            }
          }
          
          console.log(`Copied ${copiedCount} translation files to ${path.relative(process.cwd(), destDir)}`);
        } catch (error) {
          console.error(`Error copying translations to ${destDir}:`, error);
          // Don't throw here to allow build to continue
        }
      }
    },
  };
}
