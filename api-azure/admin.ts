/**
 * Azure Functions entry — register with the Node programming model v4, e.g.:
 *   import { app } from '@azure/functions'
 *   import { adminHttp } from './admin'
 *   app.http('admin', { methods: ['GET','POST','OPTIONS'], authLevel: 'anonymous', handler: adminHttp })
 */
export { adminHttp } from '../server/adapters/azure'
