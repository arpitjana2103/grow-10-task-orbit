import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import oxlint from "vite-plugin-oxlint";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), oxlint()],
});
