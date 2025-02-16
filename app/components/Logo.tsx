import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

function Logo() {
  return (
    <Link href='/'>
    <Image src='/logo.png' alt='Summarist Logo' width={85} height={70} unoptimized />
    </Link>
  )
}

export default Logo