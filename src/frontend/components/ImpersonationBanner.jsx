import { useAuth } from '../App'

export default function ImpersonationBanner() {
  const { user, isImpersonating, stopImpersonating } = useAuth()

  if (!isImpersonating) {
    return null
  }

  return (
    <div className="fixed top-2 left-2 z-[100] bg-amber-500 text-black px-3 py-1.5 rounded-lg flex items-center gap-3 text-sm font-medium shadow-lg">
      <span>
        Viewing as: <strong>{user?.display_name || user?.username}</strong>
      </span>
      <button
        onClick={stopImpersonating}
        className="bg-black text-amber-500 px-2 py-0.5 rounded text-xs font-bold hover:bg-gray-900 transition-colors"
      >
        Stop
      </button>
    </div>
  )
}
