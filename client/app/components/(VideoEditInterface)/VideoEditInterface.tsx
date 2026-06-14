"use client";

import React, { useEffect, useState } from "react";
import Loading from "../(loading spinner)/Loading";
import { useVideoActions } from "../../hooks/useVideoAction";
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const VideoEditInterface = () => {
  // Local stat container tracking the raw binary file
  //The File interface provides information about files and allows JavaScript in a web page to access their content.
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { videos, isLoading, progress, processing, getVideos, uploadVideo } =
    useVideoActions();

  //Side effect hook that fires once when the dashboard mounts
  useEffect(() => {
    getVideos();
  }, [getVideos]); // only triggers again if the memoized getVideos function reference updates.

  // Event handler to intercept and process standard HTML form submission action securely
  const handleFormSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault(); //Stops browser default page reloading behavior on form submittal routes.
    if (!selectedFile) return; // if no file selected don't submit

    // Fire upload stream
    await uploadVideo(selectedFile, selectedFile.name);
    // console.log(
    //   `File size:  ${selectedFile.size} \n  Filename:  ${selectedFile.name} \n File type:  ${selectedFile.type}\n Other: ${selectedFile.bytes}`,
    // );
    setSelectedFile(null); //Clear form input once upload is done
  };

  return (
    <div className="p-6 bg-black text-gray-500 min-h-screen">
      {/* Short-circuit evaluation tracking loading states to display an overlay block mask while data updates. */}
      {isLoading && <Loading />}

      <h1 className="text-2xl font-bold mb-4 text-white">Video Studio</h1>

      {/* File staging layout console housing native document selection controls and processing status readouts. */}
      <form
        onSubmit={handleFormSubmit}
        className="flex justify-between p-5 border border-gray-500 mb-5 rounded"
      >
        <input
          type="file"
          name="file"
          id="file"
          accept="video/*" // Restricts native browser choosing viewports exclusively to standard movie files.
          // Extracts the zero-indexed file reference object from the raw input target array safely.
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          disabled={!selectedFile} // Disables interaction states until an absolute target asset hits the local state buffer.
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {/* Ternary condition switch displaying conditional text nodes mapping the active stage of execution loops. */}
          {processing
            ? "Processing..."
            : progress > 0
              ? `Uploading ${progress}%`
              : "Post"}
        </button>
      </form>

      {/* Responsive media view grid using custom layout boundaries across variable client viewports. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Iterates through the list of video documents to dynamically project individual layout frames onto the UI. */}
        {videos.map((v) => (
          // Parent loop item wrapper identifying unique items using database-assigned _id index tags.
          <div
            key={v._id}
            className="p-4 border border-gray-800 rounded bg-neutral-950"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-200">
              {v.name}
            </h2>

            {/* Structured 16:9 aspect ratio media player container block box. */}
            <div className="aspect-video w-full bg-black rounded overflow-hidden mb-4">
              <video
                // Points target data stream pathways towards specific video identification tokens inside query hooks.
                src={`${baseUrl}/videos/get-video-asset?videoId=${v.videoId}&type=original`}
                // Supplies an asset image placeholder frame target locator using matching streaming signatures.
                poster={`${baseUrl}/videos/get-video-asset?videoId=${v.videoId}&type=thumbnail`}
                controls // Mounts the browser's native playback interface elements (play, skip, volume controls).
                className="w-full h-full object-contain"
              />
            </div>

            {/* Metadata information block displaying technical structural specifications. */}
            <div className="flex gap-2 text-sm text-gray-400">
              <span>Format: {v.extension?.toUpperCase()}</span>
              {/* Optional chaining check confirming dimensions specifications parameters exist before mapping values. */}
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
