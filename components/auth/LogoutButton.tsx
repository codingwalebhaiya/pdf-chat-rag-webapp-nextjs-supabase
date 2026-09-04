"use client"

import { useState } from "react"
import { toast } from "sonner"
import { logout } from "@/actions/auth-actions"

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const result = await logout();

    if(result?.error){
      setLoading(false)
      toast.error(result.error)
      return
    }
    setLoading(false)
    toast.success("Logged out successfully!")
    // Redirect will happen in the server action
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  )
}
