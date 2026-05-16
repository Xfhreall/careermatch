import { defineNitroConfig } from "nitro/config"

export default defineNitroConfig({
  preset: "cloudflare-module",
  compatibilityDate: "2026-05-16",
  cloudflare: {
    deployConfig: false,
  },
})
