// NO "use client" - This is a Server Component

import { userProfile } from "@/app/actions/auth-actions"
import { getAllChats } from "@/app/actions/chat-actions"
import { SidebarClient } from "@/components/layout/SidebarClient"


export async function AppSidebar() {
  // Fetch data on the server
  const profile = await userProfile()
  const chats = await getAllChats();

  return <SidebarClient
    profile={profile}
    chats={chats}
  />
}
