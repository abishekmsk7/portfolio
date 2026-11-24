# Abishek Meenatchisundaram – Portfolio

Personal portfolio site for a Front End Developer specialising in Craft CMS, Vue.js and SCSS.

## What's inside

- **View from Seat demo**: a Vue 3 seat map that redraws the view of the stage from the chosen seat
- **What's On filters**: a Vue 3 event listing with search, genre, month and sold-out filters
- **Source viewer**: every demo shows its own Vue and SCSS source, with syntax highlighting

## Tech

- HTML and SCSS (Dart Sass, BEM, design tokens, mixins, light and dark themes)
- Vue 3 (Composition API), loaded from a CDN, so there is no JavaScript build step
- Prism for syntax highlighting

## Project structure

```
index.html          Page markup
scss/               Sass source, split into partials
css/main.css        Compiled CSS (committed so GitHub Pages can serve it)
js/                 Vue components and app setup
assets/             Images
.nojekyll           Stops GitHub Pages hiding files that start with "_"
```

## Run it locally

You need [Node.js](https://nodejs.org/) installed.

```bash
npm install      # installs Sass
npm run build    # compiles scss/ into css/main.css
npm start        # serves the site locally
```

Use `npm run watch` while editing SCSS to recompile on every save, and run `npm run build` before committing.

The "View the source" panels load files with `fetch`, so use `npm start` rather than opening `index.html` directly.
