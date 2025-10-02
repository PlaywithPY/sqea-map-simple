export const metadata = {
  title: 'Carte Interactive - StreamQuest',
  description: 'Carte interactive pour StreamQuest',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=MedievalSharp&family=UnifrakturCook:wght@700&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
