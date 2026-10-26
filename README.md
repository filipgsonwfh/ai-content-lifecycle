# AI Content Lifecycle · prototype

Clickable prototype of the AI Content Lifecycle platform for Stena Line marketing — brief intake, AI generation, human review, translation and delivery to AEM. Built to show the scope of the project; every screen is functional against sample data kept in the browser (localStorage).

**Live:** https://filipgsonwfh.github.io/ai-content-lifecycle/

## What works

- **Review queue** — filter by status/channel, sort, multi-select with bulk approve/reject, pipeline stages filter the table.
- **Review** — per-brief diff / preview / iterations / AEM fragment; approve (→ translating → delivered), reject with reason, comments, inline edits of proposed copy, feedback → simulated regeneration producing a new version with a viewable diff.
- **Brief Assistant** — channel-specific questions driven by Admin → Brief questions; submitting creates a brief that visibly moves queued → generating → in review.
- **Image generation** — variants, editable prompt, regenerate, zoom, download, approve to DAM with metadata.
- **Admin** — editable channels, tonality rules, glossary (add/edit/delete/protect), SEO keywords & structured data, WCAG toggles, brief questions (add/reorder/required), roles (invite/remove), integrations (test/disconnect).
- **⌘K** search across briefs, content and glossary · notifications · reset demo data (avatar menu).

## Develop

```
npm install
npm run dev        # local dev server
npm run build      # production build to dist/
npm run icons      # regenerate src/shared/icons.js after using a new lucide icon name
```

Deploys to GitHub Pages on every push to `main` (see `.github/workflows/deploy.yml`). The Vite `base` is `/ai-content-lifecycle/`.

## Notes

- All data is fictional sample data; figures are illustrative.
- Ferry images are AI-generated placeholders, not DAM assets.
- Design source: Claude Design export ("AI Content Lifecycle"), Stena Line design tokens from stenajs-webui.
