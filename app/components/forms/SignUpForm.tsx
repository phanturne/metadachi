import React, { FormEvent, useState } from "react"
import {
  Button,
  FormControl,
  FormHelperText,
  Link,
  Stack,
  Typography
} from "@mui/joy"
import { useRouter } from "next/navigation"
import { InfoOutlined } from "@mui/icons-material"
import { supabase } from "@/app/lib/supabase/browser-client"
import { useAuthModal } from "@/app/lib/providers/AuthContextProvider"
import { Routes } from "@/app/lib/constants"
import { AuthFormType } from "@/app/components/forms/AuthForm"
import { EmailInput, PasswordInput } from "@/app/components/input"
import { get } from "@vercel/edge-config"
import { EMAIL_VERIFICATION, ROOT_URL } from "@/app/lib/config"

export function SignUpForm({
  setAuthFormType
}: {
  setAuthFormType: React.Dispatch<React.SetStateAction<AuthFormType>>
}) {
  const [error, setError] = useState<string>("")
  const { closeAuthModal } = useAuthModal()
  const router = useRouter()

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const formJson = Object.fromEntries(formData.entries())

    const email = formJson["email"] as string
    const password = formJson["password"] as string

    if (process.env.EMAIL_DOMAIN_WHITELIST || process.env.EDGE_CONFIG) {
      let patternsString = process.env.EMAIL_DOMAIN_WHITELIST

      if (process.env.EDGE_CONFIG)
        patternsString = await get<string>("EMAIL_DOMAIN_WHITELIST")

      const emailDomainWhitelist = patternsString?.split(",") ?? []

      if (
        emailDomainWhitelist.length > 0 &&
        !emailDomainWhitelist.includes(email.split("@")[1])
      ) {
        return setError(`Email is not from a whitelisted domain.`)
      }
    }

    if (process.env.EMAIL_WHITELIST || process.env.EDGE_CONFIG) {
      let patternsString = process.env.EMAIL_WHITELIST

      if (process.env.EDGE_CONFIG)
        patternsString = await get<string>("EMAIL_WHITELIST")

      const emailWhitelist = patternsString?.split(",") ?? []

      if (emailWhitelist.length > 0 && !emailWhitelist.includes(email)) {
        return setError(`Email is not whitelisted.`)
      }
    }

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${ROOT_URL}/${Routes.Setup}`
      }
    })

    // Show error message and return early if the signup failed
    if (error) {
      setError(error.message)
      return
    }

    // Handle successful signup
    closeAuthModal()
    setAuthFormType(AuthFormType.Login)

    if (!EMAIL_VERIFICATION) {
      // Temporary workaround: Reload to set the access/refresh token properly
      window.location.reload()
      router.push(Routes.Setup)
    } else {
      router.push(
        `${Routes.Login}?message=Check inbox to verify email address&variant=success`
      )
    }
  }

  return (
    <form onSubmit={handleSignup}>
      <Stack spacing={2}>
        <Typography level="h3" sx={{ alignSelf: "center" }}>
          Join Now
        </Typography>
        <FormControl error={error != ""}>
          <EmailInput />
        </FormControl>
        <FormControl error={error != ""}>
          <PasswordInput />
          {error && (
            <FormHelperText>
              <InfoOutlined />
              {error}
            </FormHelperText>
          )}
        </FormControl>
        <Button type="submit">Create account</Button>
        <Typography
          endDecorator={
            <Link
              component="button"
              onClick={() => {
                setAuthFormType(AuthFormType.Login)
              }}
            >
              Login
            </Link>
          }
          fontSize="sm"
          sx={{ alignSelf: "center" }}
        >
          I already have an account!
        </Typography>
      </Stack>
    </form>
  )
}
