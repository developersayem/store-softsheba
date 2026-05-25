import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function MessagePreview({ message, id }: { message: string; id: string }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);
const windowWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > 48);
    }
  }, [message, windowWidth]);

  return (
    <div>
      <p
        ref={textRef}
        style={{
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
      }}
        className="text-gray-700 dark:text-gray-200 overflow-hidden text-ellipsis"
      >
        {message}
      </p>
      {isClamped && (
        <div className="text-end">
          <Link
            href={`/dashboard/support/${id}`}
            className="mt-2 inline-block text-sm text-primary font-medium hover:text-blue-400 hover:underline"
          >
            See more →
          </Link>
        </div>
      )}
    </div>
  );
}
