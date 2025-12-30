import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center px-4">
      <Head>
        <title>Festival Voting App</title>
        <meta name="description" content="Real-time voting application for cultural festivals" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-gray-100">
          🎭 Festival Voting App
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-8 sm:mb-12">
          Real-Time Voting System for Cultural Performances
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {/* Voter Card */}
          <a
            href="/vote"
            className="group bg-gray-800 border-2 border-gray-700 rounded-2xl p-8 hover:border-gray-600 hover:bg-gray-750 transform transition-all duration-300 shadow-xl"
          >
            <div className="text-6xl mb-4">🗳️</div>
            <h2 className="text-3xl font-bold mb-3">Vote</h2>
            <p className="text-gray-300">
              Rate performances and share your feedback
            </p>
            <div className="mt-6 inline-flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform">
              Start Voting
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>

          {/* Judge Card */}
          <div className="bg-gradient-to-br from-purple-800 to-indigo-800 border-2 border-purple-600 rounded-2xl p-8 shadow-xl">
            <div className="text-6xl mb-4">⚖️</div>
            <h2 className="text-3xl font-bold mb-3">Judges</h2>
            <p className="text-gray-200 mb-6">
              Password-protected judge panels
            </p>
            <div className="space-y-2">
              <a
                href="/judge/dance1"
                className="block bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-sm font-semibold transition-all text-center"
              >
                🎭 Dance Judge 1
              </a>
              <a
                href="/judge/dance2"
                className="block bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-sm font-semibold transition-all text-center"
              >
                🎭 Dance Judge 2
              </a>
              <a
                href="/judge/music1"
                className="block bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-sm font-semibold transition-all text-center"
              >
                🎵 Music Judge 1
              </a>
              <a
                href="/judge/music2"
                className="block bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 text-sm font-semibold transition-all text-center"
              >
                🎵 Music Judge 2
              </a>
            </div>
          </div>

          {/* Admin Card */}
          <a
            href="/admin"
            className="group bg-gray-800 border-2 border-gray-700 rounded-2xl p-8 hover:border-gray-600 hover:bg-gray-750 transform transition-all duration-300 shadow-xl"
          >
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-3xl font-bold mb-3">Admin</h2>
            <p className="text-gray-300">
              Manage polls and view leaderboard results
            </p>
            <div className="mt-6 inline-flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform">
              Admin Dashboard
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Real-Time Updates</h3>
            <p className="text-gray-400 text-sm">
              Instant synchronization across all devices
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-lg mb-2">Fair Ranking</h3>
            <p className="text-gray-400 text-sm">
              Smart scoring system for accurate results
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-semibold text-lg mb-2">Mobile Ready</h3>
            <p className="text-gray-400 text-sm">
              Optimized for smartphones and tablets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
