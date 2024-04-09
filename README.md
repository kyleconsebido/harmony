# Harmony

A hobby project developed for practice purposes; Harmony is a messaging web application built using Vue 3, Firebase and Cloudfare Pages.

## Project Setup

```sh
pnpm install
```

### Copy and populate environment variables

```sh
cp .env.example .env
```

<b>Development variables</b>

```sh
cp .env.development.example .env.development
cp .dev.vars.example .dev.vars
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

<b>In another terminal:</b>

```sh
pnpm wrangler
```

### Type-Check, Compile and Minify for Production

```sh
pnpm preview
```