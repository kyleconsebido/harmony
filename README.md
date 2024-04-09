# Harmony

A hobby project developed for practice purposes; Harmony is a messaging web application built using Vue 3, Firebase and Cloudfare Functions.

## Project Setup

```sh
pnpm install
```

### Populate environment variables

```sh
cp .env.example .env
```

#### for development

```sh
cp .env.development.example .env.development
cp .dev.vars.example .dev.vars
```

### Compile and Hot-Reload for Development

```sh
pnpm wrangler
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm preview
```