"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function MediaDetailPage() {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/upload")
      .then(res => res.json())
      .then(({ medias }) => {
        const found = medias.find(m => String(m.id) === id);
        setMedia(found || null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
        Chargement...
      </div>
    );
  }

  if (!media) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
        Média introuvable…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-white p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-3">{media.title}</h1>
        <div className="mb-2">
          {media.tags.map(tag => (
            <span key={tag} className="bg-zinc-700 rounded px-3 py-1 text-sm mr-2">#{tag}</span>
          ))}
        </div>
        <div className="text-zinc-400">{media.date} à {media.hour.slice(0,5)}</div>
      </div>

      <div className="mb-8">
        {media.fileType.startsWith("image") ? (
          <img src={media.url} alt={media.title} className="max-h-[75vh] rounded-lg shadow-xl" />
        ) : (
          <video src={media.url} controls className="max-h-[75vh] rounded-lg shadow-xl" />
        )}
      </div>

      <a
        href={media.url}
        download={media.title}
        className="bg-zinc-700 px-6 py-3 rounded-lg font-bold hover:bg-zinc-600"
      >
        Télécharger
      </a>
    </div>
  );
}
