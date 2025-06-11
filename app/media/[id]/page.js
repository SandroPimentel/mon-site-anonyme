"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

function loadMedias() {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("medias") || "[]");
  }
  return [];
}

export default function MediaDetailPage() {
  const { id } = useParams();
  const [media, setMedia] = useState(null);

  useEffect(() => {
    const all = loadMedias();
    setMedia(all.find(m => String(m.id) === String(id)));
  }, [id]);

  if (!media) {
    return (
      <div style={{height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "#18181b"}}>
        <h2>Média introuvable…</h2>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#18181b",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {/* Titre + tags + bouton retour */}
      <div style={{textAlign: "center", marginBottom: 28}}>
        <h1 style={{color: "#fff"}}>{media.title}</h1>
        <div style={{marginBottom: 12}}>
          {media.tags.map(tag => (
            <span key={tag} style={{
              background: "#444", borderRadius: 6, padding: "4px 14px", marginRight: 10,
              color: "#fff", fontSize: 16
            }}>
              #{tag}
            </span>
          ))}
        </div>
        <div style={{color: "#aaa"}}>{media.date} {media.hour && media.hour.slice(0,2) + "h"}</div>
      </div>

      {/* Media fullscreen */}
      <div style={{marginBottom: 36}}>
        {media.fileType.startsWith("image") ? (
          <img src={media.fileUrl} alt={media.title} style={{maxHeight: "75vh", borderRadius: 18, boxShadow: "0 4px 32px #0007"}} />
        ) : (
          <video src={media.fileUrl} controls style={{maxHeight: "75vh", borderRadius: 18, boxShadow: "0 4px 32px #0007", background: "#000"}} />
        )}
      </div>

      {/* Bouton télécharger */}
      <a
        href={media.fileUrl}
        download={media.title || "media"}
        style={{
          background: "#444",
          color: "#fff",
          padding: "10px 26px",
          borderRadius: 9,
          fontSize: 18,
          textDecoration: "none",
          fontWeight: "bold",
          opacity: 0.93
        }}
      >
        Télécharger
      </a>
    </div>
  );
}
