import React from 'react';

interface YouTubeEmbedProps {
  url: string;
  autoplay?: boolean;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ url, autoplay = false, className = '' }) => {
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getVideoId(url);

  if (!videoId) return null;

  return (
    <div className={`relative w-full pb-[56.25%] overflow-hidden rounded-xl shadow-lg bg-black ${className}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded youtube"
        className="absolute top-0 left-0 w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
};

export default YouTubeEmbed;