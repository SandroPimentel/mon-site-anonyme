import './globals.scss'
import Link from "next/link";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {/* Header avec titre centré et lien admin en haut à droite */}
        <header style={{
          position: "relative",
          width: "100%",
          marginBottom: "2rem",
          height: 80
        }}>
          <h1 style={{
            textAlign: "center",
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: "-1.5px",
            margin: 0,
            lineHeight: "80px",
            color: "#fff"
          }}>
            Mon site anonyme
          </h1>
        </header>
        <main style={{ maxWidth: 800, margin: '2rem auto', padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
