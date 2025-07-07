import { toast, Toaster } from "solid-toast";
import { createEffect, createSignal } from "solid-js";

type Props = {};

interface TikTokData {
  status: string | null;
  result: {
    type: string | null;
    author: {
      avatar: string | null;
      nickname: string | null;
    };
    desc: string | null;
    videoSD: string | null;
    videoHD: string | null;
    video_hd: string | null;
    videoWatermark: string | null;
    music: string | null;
    video_diyoun: string | null;
  };
}

function InputScreen({}: Props) {
  const [url, setUrl] = createSignal("");
  const [data, setData] = createSignal<TikTokData | null>(null);
  const [loading, setLoading] = createSignal(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tik.json?url=${encodeURIComponent(url())}`);
      const json = await res.json();

      if (json.status === "success") {
        setData(json);
      } else {
        throw new Error(json.error || "Failed to fetch data");
      }
    } catch (err) {
      toast.error(err.message, {
        duration: 3000,
        position: "bottom-center",
        style: { "font-size": "16px" },
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getDownloadLink = (videoUrl: string, title: string) => {
    return `https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(videoUrl)}&type=.mp4&title=${encodeURIComponent(title)}`;
  };

  const getAudioDownloadLink = (audioUrl: string, title: string) => {
    return ` https://dl.tiktokiocdn.workers.dev/api/download?url=${encodeURIComponent(audioUrl)}&type=.mp3&title=${encodeURIComponent(title)}`;
  };

  return (
    <div class="container mx-auto px-4 py-8">
      <Toaster />
      
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold mb-2">TikTok & Douyin Video Downloader</h1>
        <p class="text-gray-600">Download videos with no watermark, HD quality, or extract audio</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl mx-auto">
        <div class="flex items-center mb-4">
          <input
            placeholder="Enter TikTok or Douyin URL"
            class="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            onChange={(e) => setUrl(e.currentTarget.value)}
            value={url()}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!url().trim()) {
                toast.error("Please enter a valid URL", {
                  duration: 3000,
                  position: "bottom-center",
                  style: { "font-size": "16px" },
                });
              } else {
                fetchData();
              }
            }}
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-r-md transition-colors duration-200"
          >
            Download
          </button>
        </div>

        <div class="flex justify-center space-x-4">
          <button
            onClick={async (e) => {
              e.preventDefault();
              try {
                const permission = await navigator.permissions.query({ name: "clipboard-read" as PermissionName });
                if (permission.state === "granted" || permission.state === "prompt") {
                  const text = await navigator.clipboard.readText();
                  setUrl(text);
                }
              } catch (err) {
                console.error("Clipboard access denied", err);
              }
            }}
            class="flex items-center justify-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Paste
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              setUrl("");
              setData(null);
            }}
            class="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      </div>

      {loading() && (
        <div class="flex justify-center my-8">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {data() && (
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <div class="flex flex-col md:flex-row items-center mb-6">
              {data()!.result.author && (
                <>
                  <img
                    crossorigin="anonymous"
                    class="rounded-full h-24 w-24 mb-4 md:mb-0 md:mr-6"
                    src={data()!.result.author.avatar ?? ""}
                    alt={data()!.result.author.nickname ?? ""}
                  />
                  <div class="text-center md:text-left">
                    <h2 class="text-xl font-bold">{data()!.result.author.nickname}</h2>
                    <p class="text-gray-600 mt-2">{data()!.result.desc}</p>
                  </div>
                </>
              )}
            </div>

            <div class="mt-6">
              <video
                controls
                src={
                  data()!.result.videoSD ??
                  data()!.result.videoHD ??
                  data()!.result.videoWatermark ??
                  data()!.result.video_diyoun ??
                  data()!.result.music ??
                  ""
                }
                class="w-full rounded-md shadow-md my-3"
              ></video>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-semibold mb-4 text-center">Download Options</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data() && data().result && data().result.videoSD && (
                <a
                  href={getDownloadLink(data().result.videoSD, data().result.author?.nickname ?? "")}
                  class="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-center transition-colors duration-200"
                >
                  Download Low Res (No Watermark)
                </a>
              )}
              
              {data() && data().result && data().result.videoHD && (
                <a
                  href={getDownloadLink(data().result.videoHD, data().result.author?.nickname ?? "")}
                  class="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-center transition-colors duration-200"
                >
                  Download HD (No Watermark)
                </a>
              )}
              
              {data() && data().result && data().result.videoWatermark && (
                <a
                  href={getDownloadLink(data().result.videoWatermark, data().result.author?.nickname ?? "")}
                  class="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-center transition-colors duration-200"
                >
                  Download With Watermark
                </a>
              )}
              
              {data() && data().result && data().result.music && (
                <a
                  href={getAudioDownloadLink(data().result.music, data().result.author?.nickname ?? "")}
                  class="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-center transition-colors duration-200"
                >
                  Download Audio Only (MP3)
                </a>
              )}
              
              {data() && data().result && data().result.video_diyoun && (
                <a
                  href={getDownloadLink(data().result.video_diyoun, data().result.author?.nickname ?? "")}
                  class="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-center transition-colors duration-200"
                >
                  Download Diyoun HD (No Watermark)
                </a>
              )}
              
              <a 
                href="/"
                class="p-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-center transition-colors duration-200"
              >
                Download Another Video
              </a>
            </div>
          </div>
        </div>
      )}
      
      <div class="text-center text-sm text-gray-500 mt-8">
        <p>This service uses Cloudflare Workers to proxy downloads and remove watermarks.</p>
        <p class="mt-2">For educational purposes only. Respect copyright laws in your jurisdiction.</p>
      </div>
    </div>
  );
};

export default InputScreen;
