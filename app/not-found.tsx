import Link from 'next/link'
import { Button } from './components/reusable'
 
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Button variant='default'>
      <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
}