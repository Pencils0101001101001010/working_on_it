"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loading from "../(loading spinner)/Loading";
import axios from "axios";
import { useRouter } from "next/navigation";

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

// Axios CancelToken allows you to abort/cancel HTTP requests mid-flight.
const CancelToken = axios.CancelToken;
// Global variable to store the cancellation function for the current upload.
let cancel;

const VideoEditInterface = () => {
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [filename, setFilename] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Tracks upload progress from 0 to 100 percent
  const [progress, setProgress] = useState(0);
  // Tracks if the file has reached 100% upload and is now being processed by the server.
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const getVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
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

  // --- UTILITY FUNCTIONS ---
  // Resets all state variables back to their initial empty values and cancels active requests.
  const cancelUploading = () => {
    setIsLoading(false);
    setProcessing(false);
    setFilename("");
    setProgress(0);
    setFile(null);
  };

  const handleVideoPost = async (e: any) => {
    e.preventDefault();
    if (!file) return setError("Please select a video file first");

    setIsLoading(true);
    setProgress(0);
    setProcessing(false);
    try {
      const { data } = await axios.post(`${baseUrl}/videos`, file, {
        withCredentials: true, // this is important, if not included then auth middleware will fail
        headers: {
          filename: filename,
        },

        // Native Axios hook that monitors file chunks arriving at the server.
        onUploadProgress: (data) => {
          // Calculates the current percentage.
          const progressNumber = Math.round((100 * data.loaded) / data.total!);
          setProgress(progressNumber);
          // If the network upload hits 100%, switch UI state to "processing" on the backend.
          if (progressNumber === 100) setProcessing(true);
        },
        // Attaches the executor function to capture the cancel token reference.
        cancelToken: new CancelToken(function executor(c) {
          cancel = c; // Assigns the cancel function to our global variable
        }),
      });

      if (data.status === "success") {
        cancelUploading(); //reset states
        setSuccess("File was uploaded successfully");
        await getVideos();
        router.refresh();
      }
    } catch (error: any) {
      if (error.response && error.response.data.error) {
        setError(error.response.data.error);
        cancelUploading();
      }
    }
  };

  const onInputFileChange = async (e: any) => {
    setFilename(e.target.files[0]?.name);
    setFile(e.target.files[0]);
  };

  // console.log(filename);
  // console.log(file);

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
      <form
        onSubmit={handleVideoPost}
        className="flex justify-between p-5 border border-gray-500 mb-5"
      >
        {" "}
        <input type="file" name="file" id="file" onChange={onInputFileChange} />
        <button type="submit">Post</button>
      </form>

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
        <div></div>
      </div>
    </div>
  );
};

export default VideoEditInterface;
