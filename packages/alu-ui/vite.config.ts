import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   build: {
//     minify: "terser",
//     lib: {
//       // Could also be a dictionary or array of multiple entry points
//       // entry: [
//       //   path.resolve(__dirname, 'src/Button/index.ts'),
//       //   path.resolve(__dirname, 'src/Dropdown/index.ts'),
//       // ],
//       entry: 'src/index.ts',
//       name: 'AluUI',
//       // the proper extensions will be added
//       // fileName: 'alu-ui',
//       fileName: (format) => `alu-ui.${format}.js`,
//     },
//     rollupOptions: {
//       input: {
//         Button: "src/Button/index.ts",
//         Dropdown: "src/Dropdown/index.ts",
//       },
//       // make sure to externalize deps that shouldn't be bundled
//       // into your library
//       external: ['react', 'react-dom', 'sass', 'next', '@fortawesome/fontawesome-svg-core'],
//       output: {
//         inlineDynamicImports: false,
//         dir: "dist",
//         format: "system",
//         entryFileNames: "[name].js",
//         chunkFileNames: "[name]-[hash].js",
//         // Provide global variables to use in the UMD build
//         // for externalized deps
//         // globals: {
//         //   react: 'React',
//         //   'react-dom': 'ReactDOM',
//         //   sass: "SASS",
//         // },
//       },
//     },
//   },
// })


export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    minify: "terser",
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'AluUI',
      formats: ["es"],
      fileName: (format) => `alu-ui.${format}.js`,
    },
    rollupOptions: {
      input: {
        AsyncButton: "src/AsyncButton/index.ts",
        AsyncForm: "src/AsyncForm/index.ts",
        Button: "src/Button/index.ts",
        ButtonGroup: "src/ButtonGroup/index.ts",
        Checkbox: "src/Checkbox/index.ts",
        Dropdown: "src/Dropdown/index.ts",
        DropdownButton: "src/DropdownButton/index.ts",
        FileUpload: "src/FileUpload/index.ts",
        LinkButton: "src/LinkButton/index.ts",
        Modal: "src/Modal/index.ts",
        Popover: "src/Popover/index.ts",
        Select: "src/Select/index.ts",
        Tabs: "src/Tabs/index.ts",
        TextInput: "src/TextInput/index.ts",
        Tooltip: "src/Tooltip/index.ts",
      },
      external: ['react', 'react-dom', 'sass', 'next', '@fortawesome/fontawesome-svg-core'],
      output: {
        inlineDynamicImports: false,
        dir: "dist",
        format: 'es',
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",

        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'styled-components': 'styled',
        },
      
        // Splits Next differently
        manualChunks(id) {
          if (id.includes('node_modules') && id.includes('next')) {
            return 'next';
          }
        },
      },
    },
  },
});
