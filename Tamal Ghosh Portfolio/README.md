# Tamal Ghosh: portfolio website

A static site in plain HTML, CSS and JavaScript. No build step and no frameworks. Open `index.html` in a browser to see it.

## Files

```
index.html                  Home page (8 "sheets": hero, work, AI automation, experience,
                            sectors & regions, skills, testimonials, contact)
work/*.html                 Four case studies (Hudayriat, King Salman Park, KSAB, Singapore & Taiwan)
css/style.css               All styles. Colours and fonts are set at the top, in :root
js/main.js                  All animation and interaction (no libraries)
assets/tamal-ghosh.jpg      Portrait (cropped to remove the AI-edit mark in the corner)
assets/Tamal-Ghosh-CV.pdf   Downloadable CV (made from _source/cv.html)
assets/og-image.png         Link-preview picture for LinkedIn and WhatsApp (made from _source/og.html)
assets/favicon.svg          Browser-tab icon
_source/                    Sources for the CV and the preview image. Don't upload this folder
```

## Dummy details to replace before going live

| What | Where |
|---|---|
| Email `tamal.ghosh@example.com` | `index.html` (contact links, form, mobile bar), each `work/*.html`, `_source/cv.html` |
| Phone / WhatsApp `+971 50 000 0000` (`wa.me/971500000000`) | `index.html` (contact, mobile bar), `_source/cv.html` |
| Domain `tamalghosh.com` | Canonical, og:url, og:image and JSON-LD in every page; `_source/og.html`; `_source/cv.html` |
| The three testimonial quotes | `index.html`, "What people say" section. **These are invented. Replace them with real quotes or remove the section.** |
| AI time savings (3 h → 5 min, 1 day → 40 min, 2 h → 15 min) and the editor outputs (248 crossings, 1,340 pipes) | `index.html`, "BIM × AI" section and `js/main.js` (the `TABS` list) |
| Singapore & Taiwan project details | `index.html` card PRJ-04 and `work/transport-asia.html` |
| Case-study narratives (context, challenge, approach) | `work/*.html`: written from the LinkedIn profile, so Tamal should check every line |
| Project drawings | Code-drawn illustrations. Replace with real (cleared) screenshots if the clients allow it |

**Check with Tamal:** LinkedIn shows him as Senior BIM Engineer until Jun 2025 and BIM Lead from Apr 2025. The two overlap, and the site shows the dates exactly as LinkedIn has them.

## Remaking the CV and the preview image

- **CV:** open `_source/cv.html` in Edge or Chrome, press Ctrl + P, set **Save as PDF**, paper **A4**, margins **None**, tick **Background graphics**, and save over `assets/Tamal-Ghosh-CV.pdf`.
- **Preview image:** open `_source/og.html` and take a 1200 × 630 screenshot (DevTools → device toolbar → 1200 × 630 → "Capture screenshot"). Save it over `assets/og-image.png`.

## Publishing

Any static host works, such as Vercel, Netlify or GitHub Pages. Upload everything except `_source/` and this README, then point the domain at it.

## Animation notes

- Line drawings draw themselves through `class="draw" pathLength="1"` on SVG paths, when their section scrolls into view.
- The hero corridor's chainage ticks, manholes and moving survey dot are added by `main.js` along the `#cl` path.
- Visitors whose system asks for reduced motion get a still page with everything visible.
