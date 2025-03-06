import React from 'react'

function page() {
  return (
    <section className='flex flex-col items-center justify-center min-h-screen space-y-5'>
      <div className='space-x-2'>
      <label className='text-lg text-start'>Email</label>
      <input type='text' className='border rounded-md p-1' placeholder='Enter Email'/>
      </div>
      <div className='space-x-2'>
      <label className='text-lg text-start'>Password</label>
      <input type='text' className='border rounded-md p-1' placeholder='Enter Password'/>
      </div>
    </section>
  )
}

export default page