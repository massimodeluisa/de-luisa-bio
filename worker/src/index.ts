/** Cloudflare Worker entry — thin re-export of the shared Open Bio admin API. */
export { type Env, type IStorage, handleRequest } from '../../server/core/handler'
export { default } from '../../server/core/handler'
