// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { HrdDashboardPayload } from "@/shared/repository/platform/action"

const { createHrdJob, deleteHrdJob, fetchHrdDashboard, toast, updateHrdJob } =
  vi.hoisted(() => ({
    createHrdJob: vi.fn(),
    deleteHrdJob: vi.fn(),
    fetchHrdDashboard: vi.fn(),
    toast: {
      error: vi.fn(),
      info: vi.fn(),
      success: vi.fn(),
    },
    updateHrdJob: vi.fn(),
  }))

vi.mock("@/shared/repository/platform/action", () => ({
  createHrdJob,
  deleteHrdJob,
  fetchHrdDashboard,
  updateHrdJob,
}))

vi.mock("sonner", () => ({ toast }))

import { HrdJobsContainer } from "@/features/dashboard/hrd/containers/JobsContainer"

const emptyDashboard: HrdDashboardPayload = {
  anonymousCandidates: [],
  jobs: [],
}

describe("HrdJobsContainer create job flow", () => {
  beforeEach(() => {
    createHrdJob.mockReset()
    deleteHrdJob.mockReset()
    fetchHrdDashboard.mockReset()
    updateHrdJob.mockReset()
    toast.error.mockReset()
    toast.info.mockReset()
    toast.success.mockReset()
    fetchHrdDashboard.mockResolvedValue(emptyDashboard)
  })

  afterEach(() => {
    cleanup()
  })

  it("opens the create form and rejects an empty title", async () => {
    renderJobs()

    fireEvent.click(
      await screen.findByRole("button", { name: "Buka Lowongan" })
    )

    expect(screen.getByLabelText("Posisi baru")).toBeTruthy()
    expect(screen.getByLabelText("Deskripsi lowongan baru")).toBeTruthy()
    expect(screen.getByLabelText("Keahlian lowongan baru")).toBeTruthy()
    expect(
      screen.getByLabelText("Minimum pengalaman lowongan baru")
    ).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }))

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith("Judul lowongan wajib diisi.")
    })
    expect(createHrdJob).not.toHaveBeenCalled()
  })

  it("rejects a negative minimum experience value", async () => {
    renderJobs()

    fireEvent.click(
      await screen.findByRole("button", { name: "Buka Lowongan" })
    )
    fireEvent.change(screen.getByLabelText("Posisi baru"), {
      target: { value: "Frontend Engineer" },
    })
    fireEvent.change(
      screen.getByLabelText("Minimum pengalaman lowongan baru"),
      {
        target: { value: "-1" },
      }
    )
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }))

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith("Minimum pengalaman tidak valid.")
    })
    expect(createHrdJob).not.toHaveBeenCalled()
  })

  it("publishes a valid job only after active confirmation", async () => {
    createHrdJob.mockResolvedValue(emptyDashboard)
    renderJobs()

    await fillValidCreateForm()
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }))

    expect(createHrdJob).not.toHaveBeenCalled()

    fireEvent.click(
      await screen.findByRole("button", { name: "Publikasikan Sekarang" })
    )

    await waitFor(() => {
      expect(createHrdJob.mock.calls[0]?.[0]).toEqual({
        description: "Membangun aplikasi web",
        minYears: 2,
        skills: ["React", "TypeScript"],
        status: "active",
        title: "Frontend Engineer",
      })
    })
  })

  it("saves a valid job as draft after draft confirmation", async () => {
    createHrdJob.mockResolvedValue(emptyDashboard)
    renderJobs()

    await fillValidCreateForm()
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }))
    fireEvent.click(
      await screen.findByRole("button", { name: "Simpan sebagai Draft" })
    )

    await waitFor(() => {
      expect(createHrdJob.mock.calls[0]?.[0]).toEqual({
        description: "Membangun aplikasi web",
        minYears: 2,
        skills: ["React", "TypeScript"],
        status: "draft",
        title: "Frontend Engineer",
      })
    })
  })

  it("returns to the form without losing entered values", async () => {
    renderJobs()

    await fillValidCreateForm()
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }))
    fireEvent.click(await screen.findByRole("button", { name: "Kembali" }))

    const titleInput = await screen.findByLabelText("Posisi baru")
    expect((titleInput as HTMLInputElement).value).toBe("  Frontend Engineer  ")
    expect(createHrdJob).not.toHaveBeenCalled()
  })

  it("updates the dashboard and resets the form after publishing", async () => {
    const updatedDashboard: HrdDashboardPayload = {
      anonymousCandidates: [],
      jobs: [
        {
          candidates: 0,
          company: "CareerMatch Partner",
          description: "Membangun aplikasi web",
          embedding: "Pending",
          id: "job-1",
          minYears: 2,
          skills: ["React", "TypeScript"],
          status: "Active",
          title: "Frontend Engineer",
        },
      ],
    }
    createHrdJob.mockResolvedValue(updatedDashboard)
    const queryClient = renderJobs()

    await fillValidCreateForm()
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }))
    fireEvent.click(
      await screen.findByRole("button", { name: "Publikasikan Sekarang" })
    )

    await waitFor(() => {
      expect(queryClient.getQueryData(["hrd-dashboard"])).toEqual(
        updatedDashboard
      )
      expect(toast.success).toHaveBeenCalledWith(
        "Lowongan berhasil dipublikasikan."
      )
    })
    expect(screen.queryByText("Konfirmasi lowongan")).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Buka Lowongan" }))
    const titleInput = await screen.findByLabelText("Posisi baru")
    expect((titleInput as HTMLInputElement).value).toBe("")
  })

  it("keeps the confirmation and form data after a failed request", async () => {
    createHrdJob.mockRejectedValue(new Error("Supabase sedang tidak tersedia."))
    renderJobs()

    await fillValidCreateForm()
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }))
    fireEvent.click(
      await screen.findByRole("button", { name: "Publikasikan Sekarang" })
    )

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Supabase sedang tidak tersedia."
      )
    })
    expect(screen.getByText("Konfirmasi lowongan")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Kembali" }))
    const titleInput = await screen.findByLabelText("Posisi baru")
    expect((titleInput as HTMLInputElement).value).toBe("  Frontend Engineer  ")
  })

  it("submits only once when publish is activated twice before rerender", async () => {
    const response = deferred<HrdDashboardPayload>()
    createHrdJob.mockReturnValue(response.promise)
    renderJobs()

    await fillValidCreateForm()
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }))
    const publishButton = await screen.findByRole("button", {
      name: "Publikasikan Sekarang",
    })

    await act(async () => {
      publishButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      publishButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(createHrdJob).toHaveBeenCalledTimes(1)
    response.resolve(emptyDashboard)
  })

  it("does not let an older dashboard request overwrite a created job", async () => {
    const staleDashboardResponse = deferred<HrdDashboardPayload>()
    const updatedDashboard: HrdDashboardPayload = {
      anonymousCandidates: [],
      jobs: [
        {
          candidates: 0,
          company: "CareerMatch Partner",
          description: "Membangun aplikasi web",
          embedding: "Pending",
          id: "job-1",
          minYears: 2,
          skills: ["React", "TypeScript"],
          status: "Active",
          title: "Frontend Engineer",
        },
      ],
    }
    fetchHrdDashboard.mockReturnValue(staleDashboardResponse.promise)
    createHrdJob.mockResolvedValue(updatedDashboard)
    const queryClient = renderJobs()

    await fillValidCreateForm()
    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }))
    fireEvent.click(
      await screen.findByRole("button", { name: "Publikasikan Sekarang" })
    )

    await waitFor(() => {
      expect(queryClient.getQueryData(["hrd-dashboard"])).toEqual(
        updatedDashboard
      )
    })

    await act(async () => {
      staleDashboardResponse.resolve(emptyDashboard)
      await staleDashboardResponse.promise
      await Promise.resolve()
    })

    expect(queryClient.getQueryData(["hrd-dashboard"])).toEqual(
      updatedDashboard
    )
  })

  it("keeps closed available when editing an existing job", async () => {
    const dashboard: HrdDashboardPayload = {
      anonymousCandidates: [],
      jobs: [
        {
          candidates: 0,
          company: "CareerMatch Partner",
          description: "Membangun aplikasi web",
          embedding: "Synced",
          id: "job-1",
          minYears: 2,
          skills: ["React"],
          status: "Active",
          title: "Frontend Engineer",
        },
      ],
    }
    fetchHrdDashboard.mockResolvedValue(dashboard)
    updateHrdJob.mockResolvedValue(dashboard)
    renderJobs()

    fireEvent.click(
      await screen.findByRole("button", { name: "Edit lowongan" })
    )
    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "closed" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }))

    await waitFor(() => {
      expect(updateHrdJob.mock.calls[0]?.[0]).toMatchObject({
        id: "job-1",
        status: "closed",
      })
    })
  })
})

function renderJobs() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <HrdJobsContainer />
    </QueryClientProvider>
  )

  return queryClient
}

async function fillValidCreateForm() {
  fireEvent.click(await screen.findByRole("button", { name: "Buka Lowongan" }))
  fireEvent.change(screen.getByLabelText("Posisi baru"), {
    target: { value: "  Frontend Engineer  " },
  })
  fireEvent.change(screen.getByLabelText("Deskripsi lowongan baru"), {
    target: { value: "  Membangun aplikasi web  " },
  })
  fireEvent.change(screen.getByLabelText("Keahlian lowongan baru"), {
    target: { value: " React, TypeScript, " },
  })
  fireEvent.change(screen.getByLabelText("Minimum pengalaman lowongan baru"), {
    target: { value: "2" },
  })
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve
  })

  return { promise, resolve }
}
