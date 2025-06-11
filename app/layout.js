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
          <Link href="/admin" style={{
            position: "absolute",
            right: 38,
            top: 24,
            fontWeight: "bold",
            color: "#fff",
            background: "#23232b",
            padding: "7px 20px",
            borderRadius: 9,
            textDecoration: "none",
            opacity: .86,
            fontSize: 17,
            transition: "background 0.1s"
          }}>
            Admin
          </Link>
        </header>
        <main style={{ maxWidth: 800, margin: '2rem auto', padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
