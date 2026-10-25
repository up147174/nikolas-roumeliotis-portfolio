# Nikolas Roumeliotis — portfolio, version 2

English, cinematic, static portfolio for GitHub Pages. Home, Work, Project, About and Contact are separate pages. Editing leads the selection; the title remains Filmmaker / Editor / Digital Artist.

## Local preview

Run `python3 -m http.server 8765` in this folder, then open `http://localhost:8765/`. The content uses JSON files and must be served over HTTP.

## Videos

The preview currently shows genuine still frames from the existing Wix site. The showreel exists but has not yet been supplied.

Add the public Bunny Stream Library ID to `content/video.json`, and the showreel Video ID to `showreelVideoId`. For individual films, add their Video IDs to `bunnyVideoId` in `content/projects.json`.

When configured, the homepage starts the showreel muted and inline. Individual project pages show the film player with visitor-controlled playback. Browser settings may prevent autoplay; Bunny's player controls remain available. Allow the final and preview domains in Bunny if domain restrictions are enabled.

Never put Bunny API keys or account passwords in this repository. The Library ID and Video IDs are public embed identifiers.

## Deployment

Publish this folder's contents as the repository root using GitHub Pages. Every internal link and asset path is relative, including project links using `project.html?film=...`, so it works under a repository subdirectory or a custom domain.

Repository: https://github.com/up147174/nikolas-roumeliotis-portfolio

GitHub Pages is configured to publish the `main` branch from the repository root:
https://up147174.github.io/nikolas-roumeliotis-portfolio/

Push updates to `main` to publish changes automatically. Primary domain: https://roumeliotisnikolas.com/

The `www` variant points to GitHub Pages and redirects to the primary domain. `CNAME` preserves the domain on future deployments. DNS is managed at Spaceship; HTTPS certificates are managed by GitHub Pages. The Bunny showreel is still to be connected.

## Content and sources

Project names, dates, roles and credits come from Nikolas's public Wix portfolio. The About copy has been rewritten for the confirmed focus on editing and artist collaborations. Review the spelling of all third-party credits before final publication.

Photographic stills originate from the user's public Wix portfolio. The generated mockup is a design reference only and is not shipped as website imagery. Barlow Condensed and DM Sans are self-hosted from Google Fonts; their SIL Open Font Licenses are included under `assets/fonts/`.
