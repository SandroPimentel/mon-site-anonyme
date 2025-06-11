import './globals.scss';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <header className="site-header">
          <h1>Mon site</h1>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
