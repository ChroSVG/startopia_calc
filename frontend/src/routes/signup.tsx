import { createFileRoute, redirect } from "@tanstack/react-router"

import { SignUpForm } from "@/components/Auth/SignUpForm"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({ to: "/" })
    }
  },
  head: () => ({
    meta: [{ title: "Sign Up - FastAPI Template" }],
  }),
})

function SignUp() {
  return <SignUpForm />
}
