"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useVideoActions } from "../../hooks/useVideoAction";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const ResizeModal = () => {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const { videos, selectedVideoId, setSelectedVideoId, resizeVideo } =
    useVideoActions();

  const currentVideo = videos.find((v) => v.videoId === selectedVideoId);

  if (!selectedVideoId) return null;

  const handleClose = () => {
    setWidth("");
    setHeight("");
    setSelectedVideoId(null);
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const maxWidth = currentVideo?.dimensions?.width || 0;
    const maxHeight = currentVideo?.dimensions?.height || 0;
    const parsedWidth = parseInt(width, 10);
    const parsedHeight = parseInt(height, 10);

    if (
      isNaN(parsedWidth) ||
      isNaN(parsedHeight) ||
      parsedWidth <= 0 ||
      parsedHeight <= 0
    ) {
      return toast.error("Please add a valid size.");
    }
    if (parsedWidth > maxWidth || parsedHeight > maxHeight) {
      return toast.error(
        `Dimensions cannot exceed the original size (${maxWidth}x${maxHeight})`,
      );
    }
    if (parsedWidth % 2 !== 0 || parsedHeight % 2 !== 0) {
      return toast.error("Numbers must be even numbers.");
    }

    try {
      await resizeVideo(width, height);
      setWidth("");
      setHeight("");
    } catch (err) {
      console.error(err);
    }
  };

  //DATA HANDLING LOGIC ---
  const resizesObj = currentVideo?.resizes || {};
  const dimensionsArray = Object.keys(resizesObj);

  //   Filter out processing vs completed files
  const processingVideos = dimensionsArray.filter(
    (dim) => resizesObj[dim]?.processing,
  );
  const processedVideos = dimensionsArray.filter(
    (dim) => !resizesObj[dim]?.processing,
  );

  //   Sort processedVideos array from highest resolution to lowest resolution
  processedVideos.sort((a, b) => {
    const [widthA, heightA] = a.split("x").map(Number);
    const [widthB, heightB] = b.split("x").map(Number);
    if (widthA !== widthB) return widthB - widthA;
    return heightB - heightA;
  });

  const sortedDimensions = [...processingVideos, ...processedVideos];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 p-6 rounded border border-gray-800 max-w-md w-full text-white shadow-xl">
        <h2 className="text-xl font-bold mb-4">Resize {currentVideo?.name}</h2>

        <form onSubmit={handleSubmit} className="flex gap-2 items-center mb-6">
          <input
            placeholder="Width"
            type="number"
            value={width}
            required
            onChange={(e) => setWidth(e.target.value)}
            className="w-full p-2 rounded bg-black border border-gray-700 text-sm focus:outline-none focus:border-blue-500"
          />
          <span className="text-gray-500">&times;</span>
          <input
            placeholder="Height"
            type="number"
            value={height}
            required
            onChange={(e) => setHeight(e.target.value)}
            className="w-full p-2 rounded bg-black border border-gray-700 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-orange-700 hover:bg-orange-900 text-white px-4 py-2 rounded text-sm transition"
          >
            Submit
          </button>
        </form>

        {/* VISUAL DISPLAY CONSOLE --- */}
        <div className="border-t border-gray-800 pt-4">
          <h4 className="font-semibold text-sm mb-3 text-gray-300">
            Your Resizes:
          </h4>

          {sortedDimensions.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {sortedDimensions.map((dimensions) => {
                const [w, h] = dimensions.split("x");
                const isProcessing = resizesObj[dimensions]?.processing;

                return (
                  <div
                    key={dimensions}
                    // Conditional styling based on tracking state parameters natively
                    className={`flex justify-between items-center p-2 rounded border text-sm transition ${
                      isProcessing
                        ? "bg-neutral-950 border-orange-900/40 text-orange-500 animate-pulse"
                        : "bg-black border-neutral-800 text-gray-200"
                    }`}
                  >
                    <div className="font-mono">
                      {w} &times; {h}
                    </div>

                    {isProcessing ? (
                      <span className="text-xs font-semibold uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded">
                        Processing
                      </span>
                    ) : (
                      //! need to work on this at the moment on click the user is taken to another screen and I don't want that.
                      <a
                        href={`${baseUrl}/videos/get-video-asset?videoId=${currentVideo?.videoId}&type=resize&dimensions=${dimensions}`}
                        className="bg-neutral-800 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs transition"
                      >
                        Get Download
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic py-2">
              You haven't resized this video yet.
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResizeModal;
