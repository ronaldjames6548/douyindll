import type { APIRoute } from "astro";
import { Downloader } from "@tobyg74/tiktok-api-dl";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;
    let urlTik = params.get("url") || "";

    if (!urlTik) {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      });
    }

    // Handle Douyin shortened URLs
    if (urlTik.includes("v.douyin.com")) {
      const res = await fetch(urlTik, {
        redirect: "follow",
      });

      urlTik = res.url;

      if (!urlTik.includes("douyin.com/video")) {
        throw new Error("Invalid Douyin video URL");
      }
    }

    // Download TikTok/Douyin video metadata
    const data = await Downloader(urlTik, {
      version: "v3",
    });

    // Return response with safe defaults
    return new Response(
      JSON.stringify({
        ...data,
        result: {
          ...(data.result || {}),
          video_diyoun: data.result?.video_diyoun || null,
        },
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching video:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch video data." }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      }
    );
};
