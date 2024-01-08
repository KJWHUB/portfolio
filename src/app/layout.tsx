import type { Metadata } from 'next'
import 'react-perfect-scrollbar/dist/css/styles.css'
import '@/styles/globals.scss'
import LeafBgLayout from '@/components/layout/LeafBgLayout'

export const metadata: Metadata = {
  title: 'KJW Portfolio',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <LeafBgLayout>{children}</LeafBgLayout>
      </body>
    </html>
  )
}
