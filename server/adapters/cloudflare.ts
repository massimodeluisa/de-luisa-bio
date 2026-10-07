/**
 * Cloudflare Workers adapter (default production path).
 * Deploy via worker/wrangler.toml — this file re-exports the shared handler.
 */
export { type Env, type IStorage, handleRequest, default } from '../core/handler'
