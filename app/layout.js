import './globals.scss'
import Link from "next/link";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <nav>
          <Link href="/" legacyBehavior><a>Mon site anonyme</a></Link>
          <div>
            <Link href="/" legacyBehavior><a>Accueil</a></Link>
            <Link href="/admin" legacyBehavior><a>Admin</a></Link>
          </div>
        </nav>
        <main style={{ maxWidth: 800, margin: '2rem auto', padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
