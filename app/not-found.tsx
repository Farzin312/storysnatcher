import Link from 'next/link'
import { Button } from './components/reusable'
 
export default function NotFound() {
  return (
    <div className='min-h-screen w-full flex flex-col items-center justify-center'>
      <h2>Not Found</h2>
      <p className='mb-5'>Could not find requested resource</p>
      <Button variant='default'>
      <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
}