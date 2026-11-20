# DevFest Kochi 2026

Website for DevFest Kochi 2026, run by GDG Cochin. It has the event details, speakers, agenda, tracks, a look back at past editions, an attendee badge maker and the FAQ.

Built with Next.js 16, React 19, TypeScript and Tailwind CSS 4. Motion and Lenis handle animation and smooth scrolling, and the stickers in the hero use React Three Fiber. The site is exported as plain static files, so there's no server or database behind it.

## Running it locally

You need Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Then open http://localhost:3000.

Other commands:

- `npm run lint` checks the code with ESLint.
- `npm run build` builds the static site into `out/`. The build downloads the Malayalam font from Google Fonts, so it needs internet access.
- `npx serve out` serves that build locally so you can check it before deploying. Don't use `npm run start` for this, since the site is a static export.

## Where things are

- `src/app/` has the page, layout, 404 page, fonts, global styles and the link preview image.
- `src/components/` has each section of the page and the interactive bits.
- `src/content/` holds the text and data shown on the site as JSON.
- `public/` has the images: Kochi illustrations, culture stickers, past event photos and speaker photos.

## Updating content

Most of the site is edited without touching code. The event details, speakers, agenda, tracks, past editions timeline, film roll photos and FAQ all come from JSON files in `src/content/`.

The easiest way to edit them is [Pages CMS](https://app.pagescms.org). Sign in with GitHub, open this repository and edit the forms. Saving commits straight to `main`. Speaker photos you upload there go into `public/speakers/`. The form fields are defined in `.pages.yml`.

You can also edit the JSON by hand and open a pull request.

Please confirm dates, ticket links, the agenda and speaker details with the organising team before publishing them.

`src/content/eggs.json` is generated, so leave it alone. It changes only when the organisers update the easter egg coupons.

## Deploying

Any static host works. On Vercel, import the repository and keep the defaults: install with `npm ci`, build with `npm run build`, and the output folder is `out`. No environment variables are needed. The site expects to live at the root of its domain.

## Credits

The Google Sans and Google Sans Code fonts, the GDG logo, and the DevFest 2026 shapes and colours come from Google's DevFest 2026 brand kit. They belong to Google and are used under the Google Developer Groups brand guidelines. Noto Sans Malayalam is loaded from Google Fonts.

Everything else, including the Kochi illustrations and the event photos, belongs to GDG Cochin.
