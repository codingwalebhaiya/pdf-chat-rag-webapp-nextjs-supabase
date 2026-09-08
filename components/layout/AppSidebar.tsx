// NO "use client" - This is a Server Component

import {
  userProfile,
 // getConversations,
} from "@/actions/auth-actions"
import {SidebarClient } from "@/components/layout/SidebarClient"

interface IConversation {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}


// demo conversation array
const conversations: IConversation[] = [
  {
    id: "1",
    title: "pdf 1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "pdf 2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "pdf 3",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function AppSidebar() {
  // Fetch data on the server
  const profile = await userProfile()
 // const conversations = await getConversations()

  return <SidebarClient 
  profile={profile}
   conversations={conversations} />
}
