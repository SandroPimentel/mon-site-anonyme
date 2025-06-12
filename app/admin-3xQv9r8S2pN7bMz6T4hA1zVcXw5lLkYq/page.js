"use client";
import { useState, useEffect } from "react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default function Admin() {
  const [medias, setMedias] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchMedias() {
    setLoading(true);
    const res = await fetch("/api/upload");
    if (res.ok) {
      setMedias(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("admin-auth") === "1") {
      setAuthed(true);
      fetchMedias();
    }
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      localStorage.setItem("admin-auth", "1");
      fetchMedias();
    } else {
      alert("Mot de passe incorrect !");
    }
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (evt) => setFilePreview(evt.target.result);
      reader.readAsDataURL(f);
    } else {
      setFilePreview(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !title || !date || !hour) {
      return alert("Remplis tous les champs !");
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("date", date);
    formData.append("hour", hour);
    formData.append("tags", tags);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setLoading(false);
    if (res.ok) {
      await fetchMedias();
      setTitle("");
      setDate("");
      setHour("");
      setTags("");
      setFile(null);
      setFilePreview(null);
      document.getElementById("file-input").value = "";
    } else {
      const err = await res.json().catch(() => null);
      alert("Erreur upload ! " + (err && err.error ? err.error : ""));
    }
  }

  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#18181b",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{ background: "#23232b", padding: 40, borderRadius: 12 }}
        >
          <h2 style={{ marginBottom: 18 }}>Accès admin</h2>
          <input
            type="password"
            placeholder="Mot de passe"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 7,
              border: "none",
              fontSize: 18,
              background: "#18181b",
              color: "#fff",
              width: 220,
              marginBottom: 12,
            }}
          />
          <br />
          <button
            type="submit"
            style={{
              background: "#444",
              color: "#fff",
              padding: "8px 22px",
              border: "none",
              borderRadius: 7,
              fontSize: 18,
              marginTop: 12,
            }}
          >
            Entrer
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard Admin</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        {/* ... ton formulaire ... */}
      </form>
      <hr style={{ margin: "32px 0" }} />
      <h2>Liste des médias uploadés</h2>
      {loading && <div style={{ color: "#aaa" }}>Chargement…</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {medias.map((media) => (
          <li
            key={media.id}
            style={{
              marginBottom: 24,
              background: "#23232b",
              padding: 16,
              borderRadius: 8,
              position: "relative",
            }}
          >
            <strong>{media.title}</strong> <br />
            <em>
              {media.date} {media.hour && media.hour.slice(0, 2) + "h"}
            </em>{" "}
            <br />
            <span>
              {media.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "#444",
                    borderRadius: 4,
                    padding: "2px 8px",
                    marginRight: 8,
                    fontSize: 12,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </span>
            <div style={{ marginTop: 8 }}>
              {media.fileType.startsWith("image") ? (
                <img
                  src={`/api/media/${encodeURIComponent(media.key)}`}
                  alt={media.title}
                  style={{ maxWidth: 300, borderRadius: 8 }}
                />
              ) : (
                <video
                  src={`/api/media/${encodeURIComponent(media.key)}`}
                  controls
                  style={{ maxWidth: 300, borderRadius: 8 }}
                />
              )}
            </div>
          </li>
        ))}
        {!loading && medias.length === 0 && (
          <p style={{ color: "#aaa" }}>Aucun média…</p>
        )}
      </ul>
    </div>
  );
}
