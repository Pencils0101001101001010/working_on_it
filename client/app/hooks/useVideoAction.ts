"use client";

import { useState, useCallback, useRef } from "react";
import axios, { Canceler } from "axios";
import toast from "react-hot-toast";
import { useVideoContext } from "../context/VideoContext";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// custom hook to encapsulate video operations
export const useVideoActions = () => {
  //Pulls the global video list state and state-updater form custom context provider
  const { videos, setVideos } = useVideoContext();

  // Declares UI states to track loading cycles, network upload progress bars, and backend encoding flags.
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  // useRef protects our cancel function across renders without triggering a re-render. Holds Axios token controller.
  const cancelUploadRef = useRef<Canceler | null>(null);

  //Memoized function that fetches the complete array of videos
  const getVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      //fetch request
      const response = await fetch(`${baseUrl}/videos`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) throw Error("Login to edit.");
        throw new Error("No videos were found");
      }

      if (response.status === 204) throw new Error("You have no videos");

      const data = await response.json(); //parse the response data

      setVideos(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [setVideos]); //only rebuilds reference if the context setter function memory location shifts.

  // Memoized function designed to instantly abort active uploads and reset UI interfaces clean.
  const cancelUploading = useCallback(() => {
    // Looks into current reference box to check if an active Axios cancel token callback was saved.
    if (cancelUploadRef.current) {
      cancelUploadRef.current("Upload cancelled by user."); // Fires Axios cancellation callback signaling request termination.
    }
    // Hard resets upload tracker states back to clean baseline defaults.
    setIsLoading(false);
    setProcessing(false);
    setProgress(0);
  }, []); // Rebuilt only once when component initializes due to an empty dependency array.

  //Memoized function that executes binary file uploads directly to the media server
  const uploadVideo = useCallback(
    async (file: File, filename: string) => {
      setIsLoading(true);
      setProgress(0);
      setProcessing(false);
      try {
        //Post request
        const { data } = await axios.post(`${baseUrl}/videos`, file, {
          withCredentials: true, // attaches auth session cookies
          headers: { filename },
          // Native event listener tracker capturing stream traffic snapshots directly from browser network pipe.
          onUploadProgress: (progressEvent) => {
            // Computes percentage completion by contrasting transferred chunks against original target file sizing boundaries.
            const progressNumber = Math.round(
              (100 * progressEvent.loaded) / progressEvent.total!,
            );
            setProgress(progressNumber); // Updates progress state hook with real-time numeric calculations.
            if (progressNumber === 100) setProcessing(true); // Triggers processing mode once the server receives 100% of bytes.
          },

          // Instantiates an abort pipeline configuration inside Axios framework hooks directly.
          cancelToken: new axios.CancelToken((c) => {
            cancelUploadRef.current = c; // Stores the cancel callback into the persistent useRef vault for external access.
          }),
        });
        // Parses response checks confirming server database operations completed successfully.
        if (data.status === "success") {
          toast.success("File was uploaded successfully"); // Displays green confirmation alert popup message dashboard.
          cancelUploading(); // Wipes memory tokens and tracking states clean.
          await getVideos(); // Automatically polls the network to fetch the freshly expanded file library array.
        }
      } catch (error: any) {
        if (!axios.isCancel(error)) {
          // Collects explicit backend validation error feedback descriptions or falls back to basic failure text.
          const errorMsg = error.response?.data?.error || "Upload failed";
          toast.error(errorMsg); // Logs error notification down onto screen view alerts.
          cancelUploading(); // Clears system crash traces and updates UI state to default layout modes.
        }
      }
    },
    [getVideos, cancelUploading],
  );

  // Returns hooks, arrays, variables, and handler methods to all consuming child UI dashboard interfaces.
  return {
    videos,
    isLoading,
    progress,
    processing,
    getVideos,
    uploadVideo,
    cancelUploading,
  };
};
