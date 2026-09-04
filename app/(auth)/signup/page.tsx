import SignupForm from "@/components/auth/SignupForm"
import { Suspense } from "react"


export const metadata = {
  title: "Sign Up",
  description: "Create your account",
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignupForm />
        </Suspense>
    )
}