import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'ガジェットLab',
  description: 'ガジェット・テック情報',
  keywords: 'ガジェットLab,ガジェット・テック情報',
  openGraph: {
    title: 'ガジェットLab',
    description: 'ガジェット・テック情報',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'ガジェットLab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ガジェットLab',
    description: 'ガジェット・テック情報',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-SVQXY5C3PW"></script>
      <script dangerouslySetInnerHTML={{__html:`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-SVQXY5C3PW');`}} />
      <body>{children}</body>
    </html>
  )
}
