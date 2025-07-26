import './globals.css'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'Zatse',
  description: 'Ride-sharing app like Uber',
}

export default function RootLayout({ children }) {
  return (
    <html className='dark'  lang="en" suppressHydrationWarning> 
      <body className="min-h-screen  bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
