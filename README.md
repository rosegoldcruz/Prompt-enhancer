# Prompt Enhancer

Production-ready Next.js app for enhancing prompts with DeepSeek.

## Requirements

- Node.js 18.18+
- pnpm 10+

## Environment Variables

Copy `.env.example` to `.env.local` and set values:

- `DEEPSEEK_API_KEY` (required)
- `NEXT_PUBLIC_SITE_URL` (recommended in production, e.g. `https://your-domain.com`)

## Run Locally

```bash
pnpm install
pnpm dev
```

## Production Validation

```bash
pnpm validate
```

This runs:

- lint
- typecheck
- production build

## Production Start

```bash
pnpm build
pnpm start
```

## Deploy (Vercel)

1. Import repository in Vercel
2. Set environment variables:
   - `DEEPSEEK_API_KEY`
   - `NEXT_PUBLIC_SITE_URL`
3. Deploy from `main`

## Operational Notes

- API route has request timeout and input-length guards
- Site URL normalization supports `NEXT_PUBLIC_SITE_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, and `VERCEL_URL`
- Security headers are configured in `next.config.ts`