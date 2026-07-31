import { notFound } from 'next/navigation'
import { HomeView } from '@/components/views/HomeView'
import { isLocale } from '@/lib/i18n/locales'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <HomeView />
}
