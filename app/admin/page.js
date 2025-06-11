"use client";
import { useState, useEffect } from "react";

// Gestion du stockage local
function saveMedias(medias) {
  localStorage.setItem("medias", JSON.stringify(medias));
}
function loadMedias() {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("medias") || "[]");
  }
  return [];
}

export default function Admin() {
  const [medias, setMedias] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setMedias(loadMedias());
    setIsMounted(true);
  }, []);

  // Affiche un preview du fichier local
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

  function handleDelete(id) {
  const newList = medias.filter(m => m.id !== id);
  setMedias(newList);
  saveMedias(newList);
}


  // Ajout d’un media (stocké en base64 dans localStorage)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !title || !date || !hour) return alert("Remplis tous les champs !");
    const reader = new FileReader();
    reader.onload = (evt) => {
      const newMedia = {
        id: Date.now(),
        title,
        date,
        hour,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        fileUrl: evt.target.result, // base64 local
        fileType: file.type,
        createdAt: `${date}T${hour}:00`
      };
      const updatedMedias = [newMedia, ...medias];
      setMedias(updatedMedias);
      saveMedias(updatedMedias);
      setTitle(""); setDate(""); setHour(""); setTags(""); setFile(null); setFilePreview(null);
      document.getElementById("file-input").value = "";
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h1>Dashboard Admin</h1>
      <form onSubmit={handleSubmit} style={{marginBottom: 32}}>
        <div>
          <label>Titre</label><br/>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{padding: 8, marginBottom: 12, width: 250}}
          />
        </div>
        <div>
          <label>Date</label><br/>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            style={{padding: 8, marginBottom: 12, width: 250}}
          />
        </div>
        <div>
          <label>Heure</label><br/>
          <input
            type="time"
            value={hour}
            onChange={e => setHour(e.target.value)}
            required
            step="3600"
            style={{padding: 8, marginBottom: 12, width: 250}}
          />
        </div>
        <div>
          <label>Tags (séparés par virgule)</label><br/>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="chat, bleu, plage"
            style={{padding: 8, marginBottom: 12, width: 250}}
          />
        </div>
        <div>
          <label>Fichier média (photo ou vidéo)</label><br/>
          <input
            id="file-input"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            required
            style={{marginBottom: 12}}
          />
          {filePreview && (
            <div style={{marginTop: 8}}>
              {file && file.type.startsWith("image") ? (
                <img src={filePreview} alt="preview" style={{maxWidth: 300, borderRadius: 8}} />
              ) : (
                <video src={filePreview} controls style={{maxWidth: 300, borderRadius: 8}} />
              )}
            </div>
          )}
        </div>
        <button type="submit" style={{
          background: "#333", color: "#fff", padding: "8px 16px", border: "none", borderRadius: 4, cursor: "pointer"
        }}>
          Upload
        </button>
      </form>

      <hr style={{margin: "32px 0"}}/>

        <hr style={{margin: "32px 0"}}/>

    <h2>Liste des médias uploadés</h2>
    <ul style={{listStyle: "none", padding: 0}}>
      {isMounted && medias.map(media => (
        <li key={media.id} style={{marginBottom: 24, background: "#23232b", padding: 16, borderRadius: 8, position: "relative"}}>
          <strong>{media.title}</strong> <br/>
          <em>
            {media.date} {media.hour && media.hour.slice(0,2) + "h"}
          </em> <br/>
          <span>
            {media.tags.map(tag => (
              <span key={tag} style={{background: "#444", borderRadius: 4, padding: "2px 8px", marginRight: 8, fontSize: 12}}>
                #{tag}
              </span>
            ))}
          </span>
          <div style={{marginTop: 8}}>
            {media.fileType.startsWith("image") ? (
              <img src={media.fileUrl} alt={media.title} style={{maxWidth: 300, borderRadius: 8}} />
            ) : (
              <video src={media.fileUrl} controls style={{maxWidth: 300, borderRadius: 8}} />
            )}
          </div>
          <button
            onClick={() => handleDelete(media.id)}
            style={{
              position: "absolute",
              top: 16, right: 16,
              background: "#a00",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "4px 12px",
              cursor: "pointer"
            }}
            title="Supprimer"
          >
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  </div>
);
}
