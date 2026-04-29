'use client'

import dynamic from 'next/dynamic'

const ReunionMap = dynamic(() => import('./ReunionMap'), { ssr: false })

interface ReunionMapClientProps {
  filter?: 'lost' | 'found' | 'to_adopt' | 'all'
  height?: string
}

export default function ReunionMapClient({ filter = 'all', height = '400px' }: ReunionMapClientProps) {
  return <ReunionMap filter={filter} height={height} />
}
