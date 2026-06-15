"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";

export interface VideoDimensions {
  width?: number;
  height?: number;
}

export interface VideoResize {
  processing: boolean;
}

export interface Video {
  _id: string;
  id: string;
  videoId: string;
  videoUrl: string;
  name: string;
  extension?: string;
  dimensions?: VideoDimensions;
  userId: string;
  extractedAudio: boolean;
  resizes?: Record<string, VideoResize>;
  createdAt: string;
  updatedAt: string;
}

// Define the structure of the data shared across the context tree
interface VideoContextType {
  videos: Video[];
  selectedVideoId: string | null;
  setSelectedVideoId: React.Dispatch<React.SetStateAction<string | null>>;
  setVideos: React.Dispatch<React.SetStateAction<Video[]>>;
}

//Allocate global memory for the context stream
const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  //Set up local state array that houses all loaded video data
  const [videos, setVideos] = useState<Video[]>([]);

  // track video id selected

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  //Memoizes the object package so dependents only re-render when 'videos' value changes
  const value = useMemo(
    () => ({ videos, setVideos, selectedVideoId, setSelectedVideoId }),
    [videos, selectedVideoId],
  );

  return (
    //Feeds the reactive context payload down to all children nodes
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
};

//Custom hook providing access to video state
export const useVideoContext = () => {
  //Look upward in the component tree to pull data from the nearest Provider
  const context = useContext(VideoContext);
  if (!context)
    throw new Error("UseVideoContext must be used within a videoProvider");
  return context;
};
