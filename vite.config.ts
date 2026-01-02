import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isLibMode = mode === 'lib'

  return {
    plugins: [
      react(),
      tailwindcss(),
      !isLibMode && eslint(),
      isLibMode && dts({
        include: ["src"],
        exclude: ["src/**/*.test.tsx", "src/**/*.stories.tsx", "src/App.tsx", "src/main.tsx"]
      })
    ].filter(Boolean),
    ...(isLibMode && {
      build: {
        lib: {
          entry: resolve(__dirname, "src/index.ts"),
          name: "ReactFormBit",
          formats: ['es'],
          fileName: "index"
        },
        rollupOptions: {
          external: ["react", "react-dom", "react/jsx-runtime", "tailwindcss"],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM"
            },
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === 'style.css') return 'styles.css'
              return assetInfo.name || 'assets/[name][extname]'
            }
          }
        },
        cssCodeSplit: false,
        sourcemap: false,
        emptyOutDir: true
      }
    })
  }
})