import fs from 'fs';
import path from 'path';
import { PluginOption } from 'vite';

export default function vitePluginTranslations(): PluginOption {
  return {
    name: 'vite-plugin-translations',
    apply: 'build',
    async closeBundle() {
      const srcDir = path.resolve(__dirname, 'src/data/translations');
      const destDir = path.resolve(__dirname, 'dist/translations');
      
      // Create the destination directory if it doesn't exist
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copy all JSON files from src/data/translations to dist/translations
      const files = fs.readdirSync(srcDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const srcPath = path.join(srcDir, file);
          const destPath = path.join(destDir, file);
          fs.copyFileSync(srcPath, destPath);
        }
      }
      
      console.log('Translation files copied to build directory');
    },
  };
}
