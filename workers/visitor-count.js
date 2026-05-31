/**
 * Cloudflare Worker: visitor-count
 *
 * Queries the Cloudflare Web Analytics GraphQL API and returns unique visitor
 * counts for the past year. Deploy with Wrangler and set the required secrets:
 *
 *   wrangler secret put CF_API_TOKEN   # Zone Analytics: Read permission
 *   wrangler secret put CF_ACCOUNT_TAG # Cloudflare account ID
 *   wrangler secret put CF_SITE_TAG    # Web Analytics beacon token (same as CF_BEACON_TOKEN)
 *
 * Example deploy:
 *   wrangler deploy --name visitor-count workers/visitor-count.js
 *
 * Then set CF_VISITOR_WORKER_URL in GitHub Actions secrets to the deployed URL.
 */

const ALLOWED_ORIGIN = "https://jaeunda.github.io"

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return respond(null, 204)
    }

    if (request.method !== "GET") {
      return respond(JSON.stringify({ error: "Method not allowed" }), 405)
    }

    const cache = caches.default
    const cacheKey = new Request(request.url, request)
    const cached = await cache.match(cacheKey)
    if (cached) return cached

    const now = new Date()
    const endDate = now.toISOString().split("T")[0]
    const startDate = new Date(now - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const query = `{
      viewer {
        accounts(filter: { accountTag: "${env.CF_ACCOUNT_TAG}" }) {
          rumWebsiteTagVisitsAdaptiveGroups(
            filter: {
              siteTag: "${env.CF_SITE_TAG}"
              date_geq: "${startDate}"
              date_leq: "${endDate}"
            }
            limit: 10000
          ) {
            uniq {
              uniques
            }
          }
        }
      }
    }`

    const cfRes = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    const json = await cfRes.json()
    const groups = json?.data?.viewer?.accounts?.[0]?.rumWebsiteTagVisitsAdaptiveGroups ?? []
    const visitors = groups.reduce((sum, g) => sum + (g.uniq?.uniques ?? 0), 0)

    const res = respond(JSON.stringify({ visitors }), 200, {
      "Cache-Control": "public, max-age=3600",
    })

    await cache.put(cacheKey, res.clone())
    return res
  },
}

function respond(body, status = 200, extra = {}) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      ...extra,
    },
  })
}
