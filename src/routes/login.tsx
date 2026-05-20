import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  ActivityIcon,
  BotIcon,
  ChevronLeftIcon,
  DatabaseIcon,
  ShieldCheckIcon,
} from "lucide-react"
import * as React from "react"
import { toast } from "sonner"
import {
  getDashboardPathForRole,
  getUserRole,
} from "@/features/auth/role-routing"
import { setUserCache } from "@/features/auth/user-query"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/shared/components/shadcn/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadcn/ui/card"
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

export const Route = createFileRoute("/login")({ component: LoginPage })

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

function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = authClient.useSession()
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

      toast.success("Login berhasil, mengarahkan ke dashboard...")
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

      toast.success("Pendaftaran berhasil, mengarahkan ke dashboard...")
    },
  })

  React.useEffect(() => {
    if (session.data?.user) {
      setUserCache(queryClient, session.data.user)
      void navigate({
        replace: true,
        to: getDashboardPathForRole(getUserRole(session.data.user)),
      })
    }
  }, [session.data?.user, navigate, queryClient])

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

    toast.success("Login Google berhasil, mengarahkan...")
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setError("")
  }

  return (
    <main className="paper-grid min-h-dvh overflow-x-hidden bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[1fr_440px]">
        <section className="hidden min-w-0 lg:block">
          <Link
            to="/"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            <ChevronLeftIcon aria-hidden="true" className="size-4" />
            Kembali
          </Link>
          <div className="mt-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground text-sm">
              <ActivityIcon
                aria-hidden="true"
                className="size-4 text-primary"
              />
              Real-time career intelligence
            </div>
            <h1 className="mt-6 max-w-3xl font-semibold text-5xl leading-tight md:text-7xl">
              CareerMatch command center
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-8">
              Masuk ke dashboard sesuai role untuk mengelola analisis CV,
              lowongan HRD, approval, dan konfigurasi AI berbasis data Supabase.
            </p>
          </div>
          <div className="mt-10 grid max-w-3xl gap-4 md:grid-cols-3">
            {[
              {
                body: "Better Auth session",
                icon: ShieldCheckIcon,
                label: "Auth",
              },
              {
                body: "Supabase live records",
                icon: DatabaseIcon,
                label: "Data",
              },
              {
                body: "n8n webhook pipeline",
                icon: BotIcon,
                label: "AI",
              },
            ].map(({ body, icon: Icon, label }) => (
              <div
                className="rounded-lg border border-border bg-card p-5"
                key={label}
              >
                <Icon aria-hidden="true" className="size-5 text-primary" />
                <p className="mt-5 font-medium">{label}</p>
                <p className="mt-2 text-muted-foreground text-sm">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="relative w-full overflow-hidden border-border bg-card">
          <Link
            to="/"
            className="absolute top-4 left-4 inline-flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground lg:hidden"
          >
            <ChevronLeftIcon size={14} />
            Kembali
          </Link>
          <CardHeader className="border-border border-b px-6 pt-12 pb-6 text-center lg:pt-6">
            <CardTitle className="text-2xl">CareerMatch</CardTitle>
            <CardDescription>
              Masuk atau daftar untuk melanjutkan ke dashboard role Anda.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
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

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-border border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">atau</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="mt-6 w-full"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <GoogleIcon />
              Lanjutkan dengan Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
