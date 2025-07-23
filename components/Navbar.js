import Link from 'next/link';

export default function Navbar() {
  return (
    <div
      className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[80%] h-[60px] z-50 flex items-center justify-between px-6 text-black rounded-full border"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(31, 38, 135, 0.2)"
      }}
    >
      {/* Left Side Links */}
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold hover:text-yellow-400 transition">Home</Link>
        <Link href="/rider" className="hover:text-yellow-400 transition">Ride</Link>
        <Link href="/driver" className="hover:text-yellow-400 transition">Drive</Link>
      </div>

      {/* Right Side Links */}
      <div className="flex items-center gap-6">
        <Link href="/login" className="hover:text-yellow-400 transition">Login</Link>
        <div className="px-4 py-2 rounded-3xl hover:bg-yellow-400 bg-white"><Link href="/signup" className=" text-black  z-10 transition">Signup</Link></div>
      </div>
    </div>
  );
}
