import SigninForm from "@/components/auth/SigninForm"
import { Suspense } from "react"

export const metadata = {
  title: "Signin",
  description: "Signin to your account",
}

export default function SigninPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninForm />
    </Suspense>
  )
}
