"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loading from "../(loading spinner)/Loading";

interface IVideoDimensions {
  width?: number;
  height?: number;
}

interface IVideoResize {
  processing: boolean;
}

interface IVideo {
  _id: string;
  id: string;
  videoId: string;
  videoUrl: string;
  name: string;
  extension?: string;
  dimensions?: IVideoDimensions;
  userId: string;
  extractedAudio: boolean;
  resizes?: Record<string, IVideoResize>;
  createdAt: string;
  updatedAt: string;
}

const VideoEditInterface = () => {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const getVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fetch(`${baseUrl}/videos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!result.ok) {
        setIsLoading(false);
        if (result.status === 401) {
          return setError("Login to edit videos");
        }
        return setError("No Videos were found!");
      }

      if (result.status === 204) {
        setIsLoading(false);
        return setError("You have no videos!");
      }

      const data: IVideo[] = await result.json();
      setVideos(data);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message);
    }
  };

  useEffect(() => {
    getVideos();
  }, []);

  useEffect(() => {
    if (success) {
      toast.success(success);
      setSuccess(null);
    }
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [success, error]);

  return (
    <div className="p-6 bg-black text-gray-500">
      {isLoading && <Loading />}
      <h1 className="text-2xl font-bold  mb-4"> Video Studio</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((v) => (
          <div
            key={v._id}
            className="border border-gray-500 rounded-lg p-4 shadow-sm bg-black"
          >
            <h2 className="text-xl font-semibold mb-2">{v.name}</h2>

            {/* Displaying the video using custom endpoint asset pipeline */}
            <div className="aspect-video w-full bg-black rounded overflow-hidden mb-4">
              <video
                src={`${baseUrl}/videos/get-video-asset?videoId=${v.videoId}&type=original`}
                poster={`${baseUrl}/videos/get-video-asset?videoId=${v.videoId}&type=thumbnail`}
                controls
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex gap-2 text-sm text-gray-500">
              <span>Format: {v.extension?.toUpperCase()}</span>
              {v.dimensions?.width && (
                <span>
                  • Resolution: {v.dimensions.width}x{v.dimensions.height}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoEditInterface;
