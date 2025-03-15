import React, {Suspense} from 'react'
import Summary from '../../components/services/Summary'
import { Spinner } from '@/app/components/reusable'

function page() {
  return (
    <main className='min-h-screen text-gray-800 p-8'>
      <Suspense fallback={<Spinner />}>
      <header className='text-center'>
      <h1 className="text-4xl font-bold mb-4">Generate Summaries</h1>
          <p className="text-lg text-gray-700">
          Summarize your saved transcripts or a YouTube video.
          </p>
      </header>
      <Summary />
      </Suspense>
    </main>
  )
}

export default page