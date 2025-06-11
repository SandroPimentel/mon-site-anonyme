"use client";
import { useState, useEffect } from "react";

function loadMedias() {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("medias") || "[]");
  }
  return [];
}

export default function MediaFeed() {
  const [medias, setMedias] = useState([]);
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | photo | video

  useEffect(() => {
    setMedias(loadMedias());
    setIsMounted(true);
    const onStorage = () => setMedias(loadMedias());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Feed (max 20 médias, les plus récents)
  let feed = [...medias]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);

  // Filtres (search + photo/video)
  if (filter === "photo") feed = feed.filter(m => m.fileType.startsWith("image"));
  if (filter === "video") feed = feed.filter(m => m.fileType.startsWith("video"));
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    feed = feed.filter(media =>
      media.title.toLowerCase().includes(q) ||
      media.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  // Sortie du fullscreen avec Escape, navigation dans le mode fullscreen
  useEffect(() => {
    if (fullscreenIndex === null) return;
    function handleKey(e) {
      if (e.key === "Escape") setFullscreenIndex(null);
      if (e.key === "ArrowDown") setFullscreenIndex(i => Math.min(i + 1, feed.length - 1));
      if (e.key === "ArrowUp") setFullscreenIndex(i => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [fullscreenIndex, feed.length]);

  // Scroll mobile/tactile en mode fullscreen
  useEffect(() => {
    if (fullscreenIndex === null) return;
    let touchStartY = null;
    function handleTouchStart(e) {
      touchStartY = e.touches[0].clientY;
    }
    function handleTouchEnd(e) {
      if (touchStartY === null) return;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      if (deltaY < -40) setFullscreenIndex(i => Math.min(i + 1, feed.length - 1)); // swipe up
      if (deltaY > 40) setFullscreenIndex(i => Math.max(i - 1, 0)); // swipe down
      touchStartY = null;
    }
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [fullscreenIndex, feed.length]);

  // --- FEED MODE ---
  if (fullscreenIndex === null) {
    return (
      <div className="feed-container" style={{
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
        padding: "32px 8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh"
      }}>
        <h1 style={{marginBottom: 24, textAlign: "center"}}>Feed</h1>
        {/* Barre de recherche */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Recherche par tag ou titre…"
          style={{
            width: "100%",
            maxWidth: 420,
            marginBottom: 20,
            fontSize: 18,
            padding: 10,
            borderRadius: 8,
            border: "none",
            background: "#222",
            color: "#fff",
            boxShadow: "0 1px 8px #0004"
          }}
        />
        {/* Filtres photo/video */}
        <div style={{marginBottom: 24, display: "flex", gap: 16}}>
          <button
            style={{
              background: filter === "all" ? "#444" : "#222",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
            onClick={() => setFilter("all")}
          >Tout</button>
          <button
            style={{
              background: filter === "photo" ? "#444" : "#222",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
            onClick={() => setFilter("photo")}
          >Photos</button>
          <button
            style={{
              background: filter === "video" ? "#444" : "#222",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
            onClick={() => setFilter("video")}
          >Vidéos</button>
        </div>
        {/* Feed */}
        <div className="media-feed-list" style={{width: "100%"}}>
          {isMounted && feed.map((media, i) => (
            <div
              className="media-card"
              key={media.id}
              tabIndex={0}
              onClick={() => setFullscreenIndex(i)}
              style={{
                cursor: "pointer",
                background: "#23232b",
                borderRadius: 14,
                marginBottom: 28,
                padding: 14,
                boxShadow: "0 1px 8px #0003",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              {media.fileType.startsWith("image") ? (
                <img
                  src={media.fileUrl}
                  alt={media.title}
                  style={{maxWidth: 360, maxHeight: 450, borderRadius: 10, marginBottom: 12}}
                />
              ) : (
                <video
                  src={media.fileUrl}
                  style={{maxWidth: 360, maxHeight: 450, borderRadius: 10, marginBottom: 12}}
                  controls
                  preload="none"
                  onClick={e => e.stopPropagation()} // pour ne pas passer en fullscreen si on clique play
                />
              )}
              <div style={{fontWeight: "bold", fontSize: 20, color: "#fff", marginBottom: 2}}>{media.title}</div>
              <div style={{color: "#aaa", margin: "6px 0 6px 0"}}>
                {media.date} {media.hour && media.hour.slice(0,2) + "h"}
              </div>
              <div>
                {media.tags.map(tag => (
                  <span key={tag} style={{
                    background: "#444", borderRadius: 6, padding: "4px 10px", marginRight: 8,
                    color: "#fff", fontSize: 14
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {isMounted && feed.length === 0 && <p style={{color: "#aaa"}}>Aucun média pour l’instant…</p>}
        </div>
      </div>
    );
  }

  // --- FULLSCREEN MODE ---
  const media = feed[fullscreenIndex];
  return (
    <div
      className="fullscreen-media"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        width: "100vw", height: "100vh",
        zIndex: 9999,
        background: "#18181b",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {/* Close fullscreen */}
      <button
        onClick={() => setFullscreenIndex(null)}
        style={{
          position: "absolute", top: 22, right: 28,
          background: "#111d", color: "#fff", border: "none", borderRadius: "50%",
          width: 44, height: 44, fontSize: 28, cursor: "pointer", zIndex: 10,
          opacity: 0.7, transition: "opacity .2s"
        }}
        title="Fermer"
      >✕</button>
      {/* Media en grand */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw"
      }}>
        {media.fileType.startsWith("image") ? (
          <img
            src={media.fileUrl}
            alt={media.title}
            style={{
              width: "auto",
              height: "80vh",
              maxWidth: "95vw",
              objectFit: "contain",
              borderRadius: 22,
              boxShadow: "0 4px 32px #0007",
              display: "block",
              margin: "0 auto"
            }}
          />
        ) : (
          <video
            src={media.fileUrl}
            controls
            autoPlay
            style={{
              width: "auto",
              height: "80vh",
              maxWidth: "95vw",
              borderRadius: 22,
              boxShadow: "0 4px 32px #0007",
              display: "block",
              margin: "0 auto",
              background: "#000"
            }}
            onClick={e => {
              if (e.target.requestFullscreen) e.target.requestFullscreen();
            }}
          />
        )}
      </div>
      {/* Titre + tags bien centrés */}
      <div style={{
        marginTop: 18,
        background: "rgba(24,24,28,0.90)",
        padding: 18,
        borderRadius: 16,
        maxWidth: 440,
        width: "90vw",
        marginLeft: "auto",
        marginRight: "auto",
        textAlign: "center"
      }}>
        <div style={{fontWeight: "bold", fontSize: 22, color: "#fff"}}>{media.title}</div>
        <div style={{marginTop: 8}}>
          {media.tags.map(tag => (
            <span key={tag} style={{
              background: "#444", borderRadius: 6, padding: "4px 14px", marginRight: 10,
              color: "#fff", fontSize: 15
            }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
      {/* Flèches navigation (bas et haut, centrées, plus transparentes) */}
      <div style={{
        position: "absolute",
        left: "50%",
        bottom: 36,
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}>
        {fullscreenIndex > 0 && (
          <button
            onClick={() => setFullscreenIndex(i => Math.max(i - 1, 0))}
            style={{
              background: "#222a",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 48,
              height: 48,
              fontSize: 28,
              opacity: 0.45,
              cursor: "pointer",
              marginBottom: 10
            }}
            title="Précédent"
          >▲</button>
        )}
        {fullscreenIndex < feed.length - 1 && (
          <button
            onClick={() => setFullscreenIndex(i => Math.min(i + 1, feed.length - 1))}
            style={{
              background: "#222a",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 48,
              height: 48,
              fontSize: 28,
              opacity: 0.45,
              cursor: "pointer",
              marginTop: 10
            }}
            title="Suivant"
          >▼</button>
        )}
      </div>
    </div>
  );
}
