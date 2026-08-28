interface Env {
  WORKER_URL: string
}

/**
 * Cloudflare Pages Function that proxies /api/* requests to the Worker.
 * Runs on the same origin as the frontend (conta.cordeiroe.dev), so
 * Cloudflare Access cookies are sent automatically.
 *
 * The proxy forwards the request (including cookies, body, headers) to
 * the Worker and streams the response back.
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const workerUrl =
    context.env.WORKER_URL || 'https://conta-worker.conta-worker.workers.dev'

  const targetUrl = workerUrl.replace(/\/$/, '') + url.pathname + url.search

  const headers = new Headers(context.request.headers)
  // Strip CF-specific headers that shouldn't be forwarded
  headers.delete('cf-connecting-ip')
  headers.delete('cf-ray')
  headers.delete('cf-worker')

  const init: RequestInit = {
    method: context.request.method,
    headers,
    redirect: 'manual',
  }
  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    init.body = context.request.body
  }

  const upstreamResponse = await fetch(targetUrl, init)

  const responseHeaders = new Headers(upstreamResponse.headers)
  // CORS is handled by the Worker itself

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })
}
