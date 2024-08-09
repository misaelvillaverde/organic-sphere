import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import glsl from "vite-plugin-glslify-inject";

export default defineConfig({
  plugins: [
    react(),
    glsl({
      include: "./src/shaders/**/*.(vert|frag)",
      exclude: "node_modules/**",
      types: { alias: "@shaders", library: "threejs" },
    }),
  ],
  resolve: {
    alias: {
      "@shaders": "/src/shaders/",
    },
  },
});
