# TikTok & Douyin Video Downloader

A powerful tool for downloading TikTok and Douyin videos with no watermark, in HD quality, and with MP3 extraction.

## ✅ Features

- **Support**: TikTok & Douyin
- **Quality**: SD, HD, and DIYOUn options
- **Formats**: MP4 and MP3
- **Speed**: Optimized download speeds
- **Caching**: Built-in caching system
- **Analytics**: Optional analytics integration

## 🚀 Deployment Requirements

### 1. Cloudflare Worker
Deploy the `download-worker.js` file to Cloudflare Workers:
- Set environment variables for analytics (`ANALYTICS_WEBHOOK_URL`) and caching (`DOWNLOAD_CACHE`)
- Name it `tiktok-douyin-proxy`
- Publish at `https://your-worker.example.com `

### 2. Vercel Frontend
Deploy the main app to Vercel:
- Uses Astro + SolidJS for frontend
- Tailwind CSS for styling
- Connects to Cloudflare Worker for video processing

### 3. KV Namespace
Create these KV namespaces in Cloudflare Dashboard:
- `DOWNLOAD_CACHE` - For caching popular videos
- `DOWNLOAD_LOGS` - For logging download events

## 🛠️ Local Development

1. Clone this repository
2. Run `npm install`
3. Start development server with `npm run dev`
4. Open http://localhost:3000 in your browser

## 📊 Environment Variables

Set these in `.env` or Cloudflare Worker settings:
