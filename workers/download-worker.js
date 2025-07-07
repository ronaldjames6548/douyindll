export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Analytics tracking
    if (env.ANALYTICS_WEBHOOK_URL) {
      ctx.waitUntil(fetch(env.ANALYTICS_WEBHOOK_URL, {
        method: "POST",
        body: JSON.stringify({
          path: url.pathname,
          search: url.search,
          host: url.host,
          ip: request.headers.get("CF-Connecting-IP"),
          ua: request.headers.get("User-Agent"),
          timestamp: Date.now(),
        }),
        headers: { "Content-Type": "application/json" },
      }));
    }

    // Robots.txt
    if (url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nAllow: /", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Static assets proxy
    if (url.pathname.startsWith("/_assets/")) {
      const assetOrigin = url.searchParams.get("origin") || request.headers.get("X-Origin");
      
      if (!assetOrigin) {
        return new Response("Missing 'origin' parameter or header.", { status: 400 });
      }
      
      try {
        const assetUrl = `${assetOrigin}${url.pathname}`;
        const response = await fetch(assetUrl);
        
        return new Response(response.body, {
          status: response.status,
          headers: {
            "Content-Type": response.headers.get("content-type") || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (e) {
        return new Response(`Failed to load asset: ${e.message}`, { status: 502 });
      }
    }

    // Main download route
    if (url.pathname === "/api/download") {
      const params = url.searchParams;
      let rawUrl = params.get("url");
      const type = params.get("type") || ".mp4";
      const title = params.get("title") || "video";

      if (!rawUrl) {
        return new Response("<p>Error: Missing 'url' parameter.</p>", {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      // Expand short links
      if (rawUrl.includes("v.douyin.com")) {
        try {
          const res = await fetch(rawUrl, { redirect: "follow" });
          rawUrl = res.url;
          
          if (!rawUrl.includes("douyin.com/video")) {
            return new Response("<p>Error: Invalid Douyin video URL after expansion.</p>", {
              status: 400,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            });
          }
        } catch (e) {
          return new Response(`<p>Error expanding Douyin link: ${e.message}</p>`, {
            status: 500,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
      }

      // Use KV Cache if available
      const cacheKey = `dl:${rawUrl}`;
      const cached = env.DOWNLOAD_CACHE ? await env.DOWNLOAD_CACHE.get(cacheKey) : null;

      if (cached) {
        return new Response(cached.body, {
          headers: {
            ...Object.fromEntries(cached.headers),
            "X-Cache": "HIT",
          },
        });
      }

      // Fetch original file
      try {
        const videoRes = await fetch(rawUrl);
        
        if (!videoRes.ok) {
          throw new Error(`Remote server returned ${videoRes.status}`);
        }

        const contentType =
          type === ".mp3" ? "audio/mpeg" :
          type === ".mp4" ? "video/mp4" :
          "application/octet-stream";

        const filename = `${encodeURIComponent(title)}${type}`;

        const headers = new Headers(videoRes.headers);
        headers.set("Content-Type", contentType);
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Cache-Control", "public, max-age=86400");

        const response = new Response(videoRes.body, {
          status: videoRes.status,
          headers,
        });

        // Cache the response
        if (env.DOWNLOAD_CACHE) {
          ctx.waitUntil(env.DOWNLOAD_CACHE.put(cacheKey, response.clone(), {
            expirationTtl: 86400, // 24 hours
          }));
        }

        return response;
      } catch (e) {
        console.error("Download error:", e);
        return new Response(`<p>Failed to fetch video: ${e.message}</p>`, {
          status: 502,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }

    // Fallback: 404 page
    return new Response("<h1>404 Not Found</h1>", {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
};
