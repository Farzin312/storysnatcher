import React, {Suspense} from 'react'
import { Featured, Hero, Guide, Showcase, Price, Info } from './components'
import { Spinner } from './components/reusable'

function page() {
  return (
    <Suspense fallback={<Spinner/>}>
    <div className='w-full h-full flex flex-col justify-center min-h-screen'>
      <Hero />
      <Featured />
      <Guide />
      <Showcase />
      <Price />
      <Info />
    </div>
    </Suspense>
  )
}

export default page