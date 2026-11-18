# Horex IT Solutions: website

Your Vision. Our Code.

A static single-page website (vanilla JavaScript + Tailwind CSS from the CDN). There is **no build step**:
the `public/` folder is the finished site and can be uploaded as it is.

## What is inside

```
public/
├── index.html                  All page markup (every view lives here; the router shows one at a time)
├── _headers                    Cloudflare Pages headers (security + caching)
├── robots.txt
└── assets/
    ├── css/
    │   ├── styles.css          Base styles (loaded in <head>)
    │   └── views.css           Per-page styles (loaded at the start of <body>)
    ├── img/
    │   ├── logo.png            Horex logo (transparent background)
    │   └── favicon.svg
    └── js/                     Loaded in this order, as plain <script> tags
        ├── 00-standalone-shim.js        Makes file downloads work outside Claude (see "Good to know")
        ├── 01-tailwind-config.js        Brand colours and font (emerald, navy, off-white)
        ├── 02-home.js                   Home: services tabs, chat demo, mobile menu
        ├── 03-audit-wizard.js           Free business audit: 8-step form
        ├── 04-audit-report.js           Audit report: scoring engine and bilingual report
        ├── 05-build-view.js             "Starting a business" service picker
        ├── 06-website-page.js           Website service page
        ├── 07-service-pages.js          App, Google Business Profile, SEO, Meta Ads, Social Media,
        │                                Chatbot, WhatsApp Agent, Voice Agent, Lead Follow-up,
        │                                Booking Reminders, Sales Dashboards pages
        ├── 08-demo-generator.js         Free demo website: form, OTP, generator, preview
        ├── 09-qr-poster.js              Google review QR poster maker (own QR encoder)
        ├── 10-quote-form.js             Get a quote page
        ├── 11-services-hub.js           Services hub page
        ├── 12-contact-form.js           Contact page
        ├── 13-free-tools-hub.js         Free tools hub
        ├── 14-name-ideas.js             Business name ideas + "Check this name" checklist
        ├── 15-build-my-website.js       Build my website (2-step form)
        ├── 16-budget-planner.js         Startup budget planner
        ├── 17-break-even.js             Price and break-even calculator
        └── 18-language-and-router.js    English/Hindi dictionary + the page router (loads last)
```

There is no framework (React, Vite and so on) behind this site, so there are no component or routing
*source* files beyond the ones above. Routing is `#hash`-based and lives in `18-language-and-router.js`
(`route()`; page names such as `#audit`, `#quote`, `#freetools`, `#budgetPlanner`).
Because of the hash routing, no server redirect rules are needed.

## Run it on your computer

```bash
npm install
npm start          # http://localhost:3000
npm run check      # confirms every file exists and every script parses
```

(You can also just open `public/index.html` in a browser, or use any static server.)

## Put it on GitHub

```bash
git init
git add .
git commit -m "Horex IT Solutions website"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git
git push -u origin main
```

## Deploy on Cloudflare Pages

**From GitHub (recommended):** Cloudflare dashboard → *Workers & Pages* → *Create* → *Pages* → *Connect to Git*, pick the repo, then:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `public` |

**Or from your computer:** `npm install` then `npm run deploy` (asks you to log in to Cloudflare the first time).

Add your own domain under *Custom domains* in the Pages project.

## Good to know

* **Internet needed for two things.** Tailwind CSS (`cdn.tailwindcss.com`, pinned to 3.4.17) and the Plus Jakarta Sans / Noto Sans Devanagari fonts (Google Fonts) are loaded from their CDNs, exactly as in the original. They were not copied into the project because the export was made without internet access. To self-host the fonts later: download them (for example with google-webfonts-helper), put them in `public/assets/fonts/`, and replace the Google Fonts `<link>` in `index.html` with an `@font-face` block in `styles.css`.
* **Forms are demos until you connect them.** These forms currently only `console.log` what was typed. Search for `TODO` to find each place to connect your own server, CRM or email service: `03-audit-wizard.js`, `05-build-view.js`, `10-quote-form.js`, `12-contact-form.js`, `14-name-ideas.js`, `15-build-my-website.js`, `16-budget-planner.js`, `17-break-even.js`. In `08-demo-generator.js` the free-demo form and its OTP step are simulated (any 6 digits are accepted, and no email is sent); connect a real OTP/email service there before relying on it.
* **Contact number** is `+91 9414122762` (calls and WhatsApp). Search the project for `9414122762` to change it.
* **Email** is a placeholder: set `CONTACT_EMAIL` in `12-contact-form.js` (it is empty on purpose) and the Contact card becomes a `mailto:` link.
* **"Ask AI for name ideas"** used Claude's built-in AI while the site was hosted inside Claude. On your own hosting there is no AI behind that button, so it shows the built-in "Quick ideas" instead, with a short message. To use a real AI, add your own server endpoint and call it in `14-name-ideas.js`.
* **File downloads** (poster PNG/SVG, name list) work through `00-standalone-shim.js`, which falls back to a normal browser download.
* The Audit report numbers, competitor names and Demo website text are produced in the browser from the answers given; nothing is sent anywhere.
