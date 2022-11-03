const esbuild = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");

esbuild.build({
    logLevel: "info",
    entryPoints: [ "src/index.tsx", "src/preload.ts" ],
    bundle: true,
    sourcemap: true,
    outdir: "build",
    external: [ "electron" ],
    plugins: [ sassPlugin() ],
    watch: process.argv.includes("--watch") ? {
        
    } : false
}).catch(() => {
    process.exit(1);
});