import React, {Suspense} from 'react'
import Flashcards from '../../components/services/Flashcards'
import { Spinner } from '@/app/components/reusable'

function page() {
  return (
    <main className='min-h-screen bg-blue-50 text-gray-800 p-8'>
      <Suspense fallback={<Spinner />}>
      <header className='text-center'>
      <h1 className="text-4xl font-bold mb-4">Generate Flashcards</h1>
          <p className="text-lg text-gray-700">
          Generate Flashcards using your saved transcripts or with Youtube Url
          </p>
      </header>
      <Flashcards />
      </Suspense>
    </main>
  )
}

export default page