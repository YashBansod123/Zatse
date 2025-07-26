export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4 py-16 transition-colors duration-300">
      <div className="max-w-7xl w-full flex flex-col justify-center lg:flex-row items-center gap-12">
        
        {/* LEFT SIDE: Text + Form */}
        <div className="flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-black dark:text-white mb-6 text-center">
            Be Calm and Ride with <span className="text-yellow-500">Zatse 🚖</span>
          </h1>

          <form className="space-y-4 w-full max-w-md">
            <div className=" flex flex-col gap-8">
              <input
                type="text"
                placeholder="Pickup location"
                className="w-full px-4 py-3 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <input
                type="text"
                placeholder="Dropoff location"
                className="w-full px-4 py-3 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white dark:bg-white hover:bg-yellow-500 dark:text-black py-3 rounded-lg font-semibold dark:hover:bg-yellow-500 dark:hover:text-black transition"
            >
              Book a Ride
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: You can add an image or illustration here if needed */}

      </div>
    </main>
  );
}