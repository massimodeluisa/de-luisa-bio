/**
 * Vercel serverless entry: /api/admin/*
 * vercel.json should rewrite /api/* → this handler when using a catch-all.
 */
export { default, config } from '../server/adapters/vercel'
