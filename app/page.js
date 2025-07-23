export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4 py-16">
      <div className="max-w-7xl w-full flex flex-col justify-center lg:flex-row items-center  gap-12">
        
        {/* LEFT SIDE: Text + Form */}
        <div className="flex flex-col items-center ">
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-6">
            Be Calm and Ride with <span className="text-yellow-500">Zatse 🚖</span>
          </h1>
          <form className="space-y-4 w-full max-w-md">
            <div className="flex flex-col gap-8">
            <input
              type="text"
              placeholder="Pickup location"
              className="w-full px-4 py-3 placeholder:text-gray-500 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <input
              type="text"
              placeholder="Dropoff location"
              className="w-full px-4 py-3 placeholder:text-gray-500 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
            >
              See prices
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: Illustration */}
        

      </div>
    </main>
  );
}
