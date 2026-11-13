# Aurum Web Design

*Websites that look like you paid more.*

Website for **Aurum Web Design** (aurumwebdesign.com). "Aurum" is Latin for gold.

## Files

- `index.html`: the page content
- `styles.css`: colors, fonts and layout (gold and black theme)
- `script.js`: animations, mobile menu and contact form
- `favicon.svg`: the "Au" browser-tab icon
- `work/`: three concept websites shown on the homepage, plus their preview images in `work/shots/`. Photos in the concept sites are from Unsplash (free to use)
- `ad/`: a standalone promotional page

## Run it locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Customizing

- **Contact email:** change `aurumwebsitedesigns@gmail.com` in `index.html` and in `CONTACT_EMAIL` in `script.js`.
- **WhatsApp number:** change `19147481692` in `index.html` (two links) and in `WHATSAPP_NUMBER` in `script.js`. The leading `1` is the US country code.
- **Animations:** they switch off automatically for visitors who have "reduce motion" turned on, and the opening animation plays once per visit.
- **Colors:** edit the variables at the top of `styles.css` (`--gold`, `--bg`, and so on).

## Deploying

It's a plain static site, so it works on GitHub Pages, Netlify, Vercel or Cloudflare Pages with no build step.
