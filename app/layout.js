import './globals.css'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'Zatse',
  description: 'Ride-sharing app like Uber',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
