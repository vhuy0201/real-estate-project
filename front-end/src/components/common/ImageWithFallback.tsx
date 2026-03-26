import { useState } from "react";
import { Skeleton } from "@mui/material";

interface ImageWithFallbackProps {
  src: string;
  alt?: string;
  className?: string;
  height?: number | string;
  fallback?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = "",
  className = "",
  height = "100%",
  fallback = "/images/fallback.jpg",
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center text-gray-400 text-sm ${className}`}
        style={{ height }}
      >
        Không thể tải ảnh
      </div>
    );
  }

  return (
    <>
      {!loaded && <Skeleton variant="rectangular" width="100%" height={height} />}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? "block" : "hidden"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ objectFit: "cover", height }}
      />
    </>
  );
};

export default ImageWithFallback;
