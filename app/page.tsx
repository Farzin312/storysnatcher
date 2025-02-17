import React, {Suspense} from 'react'
import { Featured, Hero, Guide } from './components'
import { Spinner } from './components/reusable'

function page() {
  return (
    <Suspense fallback={<Spinner/>}>
    <div className='w-full h-fullflex flex-col justify-center min-h-screen'>
      <Hero />
      <Featured />
      <Guide />
    </div>
    </Suspense>
  )
}

export default page