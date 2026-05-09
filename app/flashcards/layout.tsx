import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flashcards',
  description: 'Spaced repetition flashcards',
}

export default function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
