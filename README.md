# Aurum Web Design

*The Gold Standard in Web Design.*

Website for **Aurum Web Design** (aurumwebdesign.com). "Aurum" is Latin for gold.

## Files

- `index.html`: the page content
- `styles.css`: colors, fonts and layout (gold and black theme)
- `script.js`: mobile menu, scroll animations and contact form
- `favicon.svg`: the "Au" browser-tab icon

## Run it locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Customizing

- **Contact email:** change `elijahnisenbaum1@gmail.com` in `index.html` and in `CONTACT_EMAIL` in `script.js`.
- **Colors:** edit the variables at the top of `styles.css` (`--gold`, `--bg`, and so on).

## Deploying

It's a plain static site, so it works on GitHub Pages, Netlify, Vercel or Cloudflare Pages with no build step.
