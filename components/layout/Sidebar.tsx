import { Button } from "../ui/button"
import { logout } from "@/actions/auth-actions"
import { getCurrentUserWithProfile } from "@/actions/auth-actions"
import { redirect } from "next/navigation"

interface IProfile {
  email: string
  name: string
  id: string
  userId: string
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export async function Sidebar() {
  // Get user profile
  const data = await getCurrentUserWithProfile()
  console.log("profile data", data)

  if (!data) {
    redirect("/signin")
  }

  const profile: IProfile = data

  return (
    <div className="flex h-screen flex-col justify-between bg-gray-900 p-4 text-white">
      <h1 className="text-2xl font-bold">logo</h1>

      <div>
        <div>
          {profile.name}
          {profile.avatarUrl}
        </div>

        <Button onClick={logout} className="cursor-pointer" variant="outline">
          Logout
        </Button>
      </div>
    </div>
  )
}
