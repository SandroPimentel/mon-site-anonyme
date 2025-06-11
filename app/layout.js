import './globals.scss';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <nav>
          <a href="/">Mon site anonyme</a>
          <div>
            <a href="/">Accueil</a>
            <a href="/admin">Admin</a>
          </div>
        </nav>
        <main style={{ maxWidth: 800, margin: '2rem auto', padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
