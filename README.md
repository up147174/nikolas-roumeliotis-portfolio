# Nikolas Roumeliotis — portfolio

Static portfolio designed for GitHub Pages. The first version uses still frames from Nikolas's existing Wix portfolio. It includes three projects, a responsive layout and an active-project selector.

## Preview locally

Run `python3 -m http.server 8765` in this folder, then open `http://localhost:8765/`. The content files are loaded over HTTP, so opening `index.html` directly as a file will not load the projects.

## Add Bunny Stream videos

1. Upload each film to Bunny Stream and copy its Video ID.
2. Put your Bunny Stream Library ID in `content/video.json` as `bunnyLibraryId`.
3. Put each corresponding Video ID in the project's `bunnyVideoId` field in `content/projects.json`.

When both IDs exist, the active project uses the Bunny embed with `autoplay=true&muted=true&playsinline=true`. Browsers generally allow muted autoplay, but a visitor's browser or data-saving settings may prevent it. The player remains visible so they can start playback manually. Until video IDs are added, each project displays its original still.

Do not put a Bunny API key in these public files. Library IDs and video IDs are public embed identifiers. If you use domain restrictions in Bunny, allow your GitHub Pages and final domain origins.

## Deploy on GitHub Pages

This folder is the website root. Publish its contents from the repository root (`main` branch, `/root` directory) using GitHub Pages. Add the custom domain in GitHub Pages after purchasing it, then configure the DNS records with your registrar. Keep HTTPS enabled.

Project descriptions and credits reflect the existing Wix portfolio. Review all text before public launch. The current project links point to the existing Wix pages while the new site is being completed.
