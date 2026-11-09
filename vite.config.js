import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Documentos de trabalho na pasta (PDF, planilhas) não fazem parte do app.
    watch: { ignored: ['**/Documentos/**', '**/*.pdf', '**/*.xlsx', '**/*.docx', '**/*.pptx', '*.png'] },
  },
})
