import { useAuth } from '../App'

export default function ImpersonationBanner() {
  const { user, isImpersonating, stopImpersonating } = useAuth()

  if (!isImpersonating) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-2 flex items-center justify-center gap-4 text-sm font-medium">
      <span>
        Viewing as: <strong>{user?.display_name || user?.username}</strong>
      </span>
      <button
        onClick={stopImpersonating}
        className="bg-black text-amber-500 px-3 py-1 rounded text-xs font-bold hover:bg-gray-900 transition-colors"
      >
        Stop Impersonating
      </button>
    </div>
  )
}
