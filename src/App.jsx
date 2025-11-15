import { useRef, useState, useEffect } from 'react'

// Simple flip-book with up to 3 spreads
// Flow:
// - Start: Right page shows greeting + arrow
// - On click: Right page flips over onto the left; greeting fades while flipping
// - After flip: Left page reveals the memory image + caption
// - Repeat for up to 3 memories

const memories = [
  {
    image:
      'https://images.unsplash.com/photo-1517265035603-faefa167335b?q=80&w=1200&auto=format&fit=crop',
    caption:
      "The way your smile lights up every room is my favorite kind of sunrise.",
  },
  {
    image:
      'https://images.unsplash.com/photo-1496285416009-3e0b8d2d0f59?q=80&w=1200&auto=format&fit=crop',
    caption:
      "Every little adventure with you becomes a forever memory in my heart.",
  },
  {
    image:
      'https://images.unsplash.com/photo-1485217988980-11786ced9454?q=80&w=1200&auto=format&fit=crop',
    caption:
      "You are my safe place, my favorite person, and my happiest hello.",
  },
]

function ArrowIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 12h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function App() {
  const [page, setPage] = useState(0) // how many flips completed (0..memories.length)
  const [isFlipping, setIsFlipping] = useState(false)
  const [fadeText, setFadeText] = useState(false)
  const flipRef = useRef(null)

  // When the flip animation finishes, advance the spread
  useEffect(() => {
    const el = flipRef.current
    if (!el) return
    const onEnd = () => {
      setIsFlipping(false)
      setFadeText(false)
      setPage((p) => Math.min(p + 1, memories.length))
    }
    el.addEventListener('transitionend', onEnd)
    return () => el.removeEventListener('transitionend', onEnd)
  }, [])

  const handleFlip = () => {
    if (isFlipping) return
    if (page >= memories.length) return
    setFadeText(true)
    // allow text to begin fading slightly before flip
    requestAnimationFrame(() => {
      setIsFlipping(true)
    })
  }

  // Content on the right page before flipping
  const rightPageContent = () => {
    if (page === 0) {
      return (
        <div className={`h-full w-full flex flex-col items-center justify-center text-center px-6 transition-opacity duration-700 ${fadeText ? 'opacity-0' : 'opacity-100'}`}>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-rose-600">
            Happy Birthday, Wifey!
          </h1>
          <p className="mt-4 text-gray-600 max-w-xs">
            Flip the page to begin your little love story.
          </p>
        </div>
      )
    }
    if (page < memories.length) {
      return (
        <div className={`h-full w-full flex items-end justify-end p-6 transition-opacity duration-700 ${fadeText ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-sm text-gray-500">Flip for the next surprise</p>
        </div>
      )
    }
    return (
      <div className="h-full w-full flex items-center justify-center text-center px-6">
        <div>
          <h2 className="text-2xl font-semibold text-emerald-600">All done!</h2>
          <p className="mt-2 text-gray-600">I love you, today and always.</p>
        </div>
      </div>
    )
  }

  // The left page shows completed memory after each flip
  const leftPageContent = () => {
    if (page === 0) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-gray-400 italic">Cover</div>
        </div>
      )
    }
    const memory = memories[page - 1]
    return (
      <div className="relative h-full w-full">
        <img
          src={memory.image}
          alt="memory"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <p className="text-white text-sm sm:text-base drop-shadow-md">{memory.caption}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-5xl">
        <div className="mb-6 text-center">
          <p className="text-gray-600">Tap the arrow to flip</p>
        </div>

        {/* Book container with perspective */}
        <div className="relative mx-auto" style={{ perspective: '1600px' }}>
          {/* Book */}
          <div className="relative bg-white/80 rounded-xl shadow-2xl border border-white/40 overflow-hidden mx-auto"
               style={{ width: '100%', maxWidth: 960, height: 560 }}>
            {/* Center spine shadow */}
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/5" />

            {/* Left static page */}
            <div className="absolute inset-y-0 left-0 w-1/2 bg-white">
              {leftPageContent()}
            </div>

            {/* Right static base page (shows text when not flipping) */}
            <div className="absolute inset-y-0 right-0 w-1/2 bg-white">
              {rightPageContent()}
              {/* Arrow button */}
              <button
                onClick={handleFlip}
                disabled={isFlipping || page >= memories.length}
                className={`absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-lg transition-all ${
                  page >= memories.length
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-rose-500 hover:bg-rose-600 active:scale-95'
                }`}
                aria-label="Flip page"
              >
                <span className="text-sm font-semibold">Next</span>
                <ArrowIcon className="h-5 w-5" />
              </button>
            </div>

            {/* The flipping page overlay */}
            <div
              ref={flipRef}
              className="absolute inset-y-0 right-0 w-1/2 bg-white will-change-transform"
              style={{
                transformOrigin: 'left center',
                transform: isFlipping ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                transition: 'transform 1.2s cubic-bezier(0.85, 0, 0.15, 1)'
              }}
            >
              {/* Front face (visible before flip) */}
              <div className={`absolute inset-0 backface-hidden ${fadeText ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700`}>
                {rightPageContent()}
              </div>

              {/* Back face (shows paper back during flip) */}
              <div
                className="absolute inset-0 backface-hidden"
                style={{ transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, #fff, #f9fafb)' }}
              >
                {/* Subtle paper texture effect */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage:
                    'radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                  backgroundPosition: '0 0, 6px 6px',
                }} />
              </div>

              {/* Edge shadow while flipping */}
              <div className="absolute inset-y-0 left-0 w-6 pointer-events-none"
                   style={{
                     background:
                       'linear-gradient(to right, rgba(0,0,0,0.18), rgba(0,0,0,0.06), transparent)'
                   }}
              />
            </div>
          </div>
        </div>

        {/* Tiny legend */}
        <div className="mt-4 text-center text-xs text-gray-500">
          You can replace the images with your own by editing the app later.
        </div>
      </div>
    </div>
  )
}
