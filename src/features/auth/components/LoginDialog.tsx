import { useForm } from "@tanstack/react-form"
import * as React from "react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/shared/components/shadcn/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/shadcn/ui/field"
import { Input } from "@/shared/components/shadcn/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/shadcn/ui/tabs"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const GoogleIcon = () => (
  <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [activeTab, setActiveTab] = React.useState("sign-in")
  const [error, setError] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const signInForm = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError("")
      setIsSubmitting(true)
      toast.info("Memproses login...")

      const { error: signInError } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
        callbackURL: "/",
      })

      if (signInError) {
        setError(signInError.message ?? "Login gagal. Silakan coba lagi.")
        toast.error(signInError.message ?? "Login gagal. Silakan coba lagi.")
        setIsSubmitting(false)
        return
      }

      toast.success("Login berhasil.")
      onOpenChange(false)
    },
  })

  const signUpForm = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError("")
      setIsSubmitting(true)
      toast.info("Memproses pendaftaran...")

      const { error: signUpError } = await authClient.signUp.email({
        email: value.email,
        password: value.password,
        name: value.name,
        callbackURL: "/",
      })

      if (signUpError) {
        setError(signUpError.message ?? "Pendaftaran gagal. Silakan coba lagi.")
        toast.error(
          signUpError.message ?? "Pendaftaran gagal. Silakan coba lagi."
        )
        setIsSubmitting(false)
        return
      }

      toast.success("Pendaftaran berhasil.")
      onOpenChange(false)
    },
  })

  const handleGoogleSignIn = async () => {
    setError("")
    setIsSubmitting(true)
    toast.info("Mengarahkan ke login Google...")

    const { error: googleError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    })

    if (googleError) {
      setError(
        googleError.message ?? "Login dengan Google gagal. Silakan coba lagi."
      )
      toast.error(
        googleError.message ?? "Login dengan Google gagal. Silakan coba lagi."
      )
      setIsSubmitting(false)
      return
    }

    toast.success("Login Google berhasil.")
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Masuk atau Daftar</DialogTitle>
          <DialogDescription>
            Masuk dengan email atau daftar akun baru untuk melanjutkan.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Masuk</TabsTrigger>
            <TabsTrigger value="sign-up">Daftar</TabsTrigger>
          </TabsList>

          <TabsContent value="sign-in">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void signInForm.handleSubmit()
              }}
            >
              <FieldGroup>
                <signInForm.Field name="email">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="signin-email">Email</FieldLabel>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="email@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isSubmitting}
                        required
                        autoComplete="email"
                      />
                    </Field>
                  )}
                </signInForm.Field>

                <signInForm.Field name="password">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="signin-password">
                        Kata Sandi
                      </FieldLabel>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Masukkan kata sandi"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isSubmitting}
                        required
                        autoComplete="current-password"
                      />
                    </Field>
                  )}
                </signInForm.Field>

                {error && <FieldError>{error}</FieldError>}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Masuk..." : "Masuk"}
                </Button>
              </FieldGroup>
            </form>
          </TabsContent>

          <TabsContent value="sign-up">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void signUpForm.handleSubmit()
              }}
            >
              <FieldGroup>
                <signUpForm.Field name="name">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="signup-name">
                        Nama Lengkap
                      </FieldLabel>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isSubmitting}
                        required
                        autoComplete="name"
                      />
                    </Field>
                  )}
                </signUpForm.Field>

                <signUpForm.Field name="email">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="email@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isSubmitting}
                        required
                        autoComplete="email"
                      />
                    </Field>
                  )}
                </signUpForm.Field>

                <signUpForm.Field name="password">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="signup-password">
                        Kata Sandi
                      </FieldLabel>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Buat kata sandi"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isSubmitting}
                        required
                        autoComplete="new-password"
                      />
                    </Field>
                  )}
                </signUpForm.Field>

                {error && <FieldError>{error}</FieldError>}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Mendaftar..." : "Daftar"}
                </Button>
              </FieldGroup>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-border border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">atau</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          <GoogleIcon />
          Lanjutkan dengan Google
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default LoginDialog
