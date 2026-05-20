import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FileTextIcon,
  LoaderCircleIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/shared/components/shadcn/ui/alert";
import { Badge } from "@/shared/components/shadcn/ui/badge";
import { Button } from "@/shared/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadcn/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/shadcn/ui/field";
import { Input } from "@/shared/components/shadcn/ui/input";
import { cn } from "@/shared/lib/utils";
import { Stepper } from "@/shared/components/Stepper";
import { getFileExtension, trackCareerMatchEvent } from "../analytics";
import { analyzeCvRequest } from "../api-client";
import type { NormalizedAnalysisResponse } from "../types";
import { formatFileSize, validateCvFile } from "../validators";

type UploadCvFormValues = {
  cv: File | null;
};

type UploadCvFormProps = {
  analyzeCv?: (file: File) => Promise<NormalizedAnalysisResponse>;
  onAnalysisReady: (result: NormalizedAnalysisResponse) => void;
};

const PIPELINE_STEPS = [
  "Membaca dan mengekstrak teks CV",
  "Anonimisasi data pribadi",
  "Mencari pekerjaan yang cocok",
  "Menghitung skor kompatibilitas",
  "Menyiapkan saran karier",
];

const STEPPER_STEPS = [
  {
    id: "extract",
    label: "Ekstraksi Teks",
    description: "Membaca dan mengekstrak teks dari CV Anda...",
  },
  {
    id: "anonymize",
    label: "Anonimisasi",
    description: "Menganonimisasi data pribadi untuk keamanan...",
  },
  {
    id: "search",
    label: "Pencarian Lowongan",
    description: "Mencari lowongan yang cocok dengan profil Anda...",
  },
  {
    id: "scoring",
    label: "Penilaian Kompatibilitas",
    description: "Menghitung skor kompatibilitas untuk setiap lowongan...",
  },
  {
    id: "coaching",
    label: "Rekomendasi Karir",
    description: "Menyusun rekomendasi dan saran karir...",
  },
];

const PROCESSING_MESSAGES = [
  "Membaca dan mengekstrak teks dari CV Anda...",
  "Menganonimisasi data pribadi untuk keamanan...",
  "Mencari lowongan yang cocok dengan profil Anda...",
  "Menghitung skor kompatibilitas untuk setiap lowongan...",
  "Menyusun rekomendasi dan saran karir...",
];

export function UploadCvForm({
  analyzeCv = analyzeCvRequest,
  onAnalysisReady,
}: UploadCvFormProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const [activeStep, setActiveStep] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const mutation = useMutation({
    mutationFn: analyzeCv,
    onSuccess: (result) => {
      toast.success("Analisis CV selesai.");
      trackCareerMatchEvent("cv_analysis_completed", {
        job_match_count: result.jobMatches.length,
        top_score: result.jobMatches[0]?.compatibilityScore ?? null,
      });
      onAnalysisReady(result);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal terhubung ke server. Coba lagi sebentar.";
      setSubmitError(message);
      toast.error(message);
      trackCareerMatchEvent("cv_analysis_failed", {
        stage: "request",
        error_message: message,
      });
    },
  });

  const form = useForm({
    defaultValues: {
      cv: null,
    } as UploadCvFormValues,
    onSubmit: async ({ value }) => {
      setSubmitError("");
      const file = value.cv;
      const validation = validateCvFile(file);

      if (!validation.ok) {
        setSubmitError(validation.message);
        toast.info(validation.message);
        trackCareerMatchEvent("cv_analysis_failed", {
          stage: "validation",
          error_message: validation.message,
        });
        return;
      }

      if (!file) {
        return;
      }

      trackCareerMatchEvent("cv_analysis_started", {
        filename: file.name,
        file_extension: getFileExtension(file.name),
        file_size_kb: Math.round(file.size / 1024),
      });
      toast.info("CV diupload, analisis sedang berjalan...");
      await mutation.mutateAsync(file);
    },
  });

  React.useEffect(() => {
    if (!mutation.isPending) {
      setActiveStep(0);
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStep((currentStep) =>
        Math.min(PIPELINE_STEPS.length - 1, currentStep + 1),
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [mutation.isPending]);

  function handleFileSelection(
    file: File | null,
    source: "drop" | "input",
    onChange: (value: File | null) => void,
  ) {
    onChange(file);
    setSubmitError("");

    if (!file) {
      return;
    }

    trackCareerMatchEvent("cv_file_selected", {
      source,
      file_extension: getFileExtension(file.name),
      file_size_kb: Math.round(file.size / 1024),
    });
  }

  return (
    <Card
      className="min-w-0 w-full max-w-full overflow-hidden"
      style={{
        borderColor: "#BAE6FD",
        backgroundColor: "#FFFFFF",
      }}
    >
      <CardHeader
        className="p-6 sm:p-7"
        style={{
          borderBottom: "1px solid #BAE6FD",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex flex-col gap-2">
            <p
              className="font-medium text-sm tracking-wide uppercase"
              style={{ color: "#0369A1" }}
            >
              CV Intake
            </p>
            <CardTitle
              className="font-heading text-2xl"
              style={{ color: "#0C4A6E" }}
            >
              Upload CV
            </CardTitle>
            <CardDescription
              className="max-w-xl leading-relaxed"
              style={{ color: "#0C4A6E", opacity: 0.65 }}
            >
              PDF, DOC, atau DOCX sampai 10MB. File masuk lewat endpoint
              internal CareerMatch sebelum diproses pipeline.
            </CardDescription>
          </div>
          <Badge
            className="font-medium"
            style={{
              borderColor: "#BAE6FD",
              backgroundColor: "#E7EFF5",
              color: "#0369A1",
            }}
            variant="outline"
          >
            10MB max
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="min-w-0 p-6 sm:p-7">
        {mutation.isPending ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-8 py-8"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.24 }}
          >
            <div className="flex flex-col items-center gap-4">
              <span
                className="flex size-12 items-center justify-center rounded-full"
                style={{ backgroundColor: "#E7EFF5" }}
              >
                <LoaderCircleIcon
                  aria-hidden="true"
                  className="size-6 animate-spin"
                  style={{ color: "#0369A1" }}
                />
              </span>
              <div className="text-center">
                <p
                  className="font-heading font-medium text-base"
                  style={{ color: "#0C4A6E" }}
                >
                  Analisis sedang berjalan
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "#0C4A6E", opacity: 0.6 }}
                >
                  Proses ini dapat memakan waktu sampai sekitar satu menit.
                </p>
              </div>
            </div>

            <div className="w-full max-w-md">
              <div className="h-6 overflow-hidden text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    animate={{ opacity: 1, y: 0 }}
                    className="font-medium text-sm"
                    exit={{ opacity: 0, y: -12 }}
                    initial={{ opacity: 0, y: 12 }}
                    key={activeStep}
                    style={{ color: "#0369A1" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {PROCESSING_MESSAGES[activeStep]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            <div className="w-full max-w-lg">
              <Stepper activeStep={activeStep} steps={STEPPER_STEPS} />
            </div>
          </motion.div>
        ) : (
          <motion.form
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0 flex flex-col gap-6"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.28 }}
          >
            <form.Field name="cv">
              {(field) => {
                const selectedFile = field.state.value;

                return (
                  <FieldGroup>
                    <Field data-invalid={Boolean(submitError)}>
                      <FieldLabel htmlFor="cv-upload">Upload CV</FieldLabel>
                      <motion.button
                        animate={
                          dragActive && !shouldReduceMotion
                            ? { scale: 1.01 }
                            : { scale: 1 }
                        }
                        className={cn(
                          "relative flex min-h-[280px] w-full max-w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-lg border-2 border-dashed p-8 text-center transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2",
                          dragActive
                            ? "bg-[#E7EFF5]"
                            : "hover:bg-[#F0F9FF]/60",
                        )}
                        style={{
                          borderColor: dragActive ? "#0369A1" : "#BAE6FD",
                          backgroundColor: dragActive
                            ? "#E7EFF5"
                            : "#FFFFFF",
                        }}
                        disabled={mutation.isPending}
                        onClick={() => fileInputRef.current?.click()}
                        onDragEnter={(event) => {
                          event.preventDefault();
                          setDragActive(true);
                        }}
                        onDragLeave={(event) => {
                          event.preventDefault();
                          setDragActive(false);
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          setDragActive(false);
                          const file = event.dataTransfer.files.item(0);
                          handleFileSelection(file, "drop", field.handleChange);
                        }}
                        transition={{ duration: 0.2 }}
                        type="button"
                        whileTap={
                          shouldReduceMotion ? undefined : { scale: 0.99 }
                        }
                      >
                        <span
                          className="flex size-14 items-center justify-center rounded-xl border"
                          style={{
                            borderColor: "#BAE6FD",
                            backgroundColor: "#F0F9FF",
                            color: "#0369A1",
                          }}
                        >
                          <UploadIcon aria-hidden="true" className="size-6" />
                        </span>
                        <span className="flex flex-col gap-2">
                          <span
                            className="font-heading font-semibold text-lg"
                            style={{ color: "#0C4A6E" }}
                          >
                            Pilih CV atau tarik file ke sini
                          </span>
                          <span
                            className="text-sm"
                            style={{ color: "#0C4A6E", opacity: 0.6 }}
                          >
                            Analisis berjalan setelah kamu menekan tombol submit.
                          </span>
                        </span>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium"
                          style={{
                            borderColor: "#BAE6FD",
                            backgroundColor: "#F0F9FF",
                            color: "#0C4A6E",
                          }}
                        >
                          <FileTextIcon className="size-3" />
                          PDF / DOC / DOCX
                        </span>
                      </motion.button>
                      <Input
                        accept=".pdf,.doc,.docx"
                        aria-invalid={Boolean(submitError)}
                        className="sr-only"
                        id="cv-upload"
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          const file = event.target.files?.item(0) ?? null;
                          handleFileSelection(file, "input", field.handleChange);
                        }}
                        ref={fileInputRef}
                        type="file"
                      />
                      <AnimatePresence mode="wait">
                        {selectedFile ? (
                          <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 rounded-lg border p-4"
                            exit={{ opacity: 0, y: -6 }}
                            initial={{ opacity: 0, y: 8 }}
                            style={{
                              borderColor: "#BAE6FD",
                              backgroundColor: "#F0F9FF",
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <div
                              className="flex size-10 shrink-0 items-center justify-center rounded-lg border"
                              style={{
                                borderColor: "#BAE6FD",
                                backgroundColor: "#FFFFFF",
                                color: "#0369A1",
                              }}
                            >
                              <FileTextIcon
                                aria-hidden="true"
                                className="size-5"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate font-medium text-sm"
                                style={{ color: "#0C4A6E" }}
                              >
                                {selectedFile.name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: "#0C4A6E", opacity: 0.6 }}
                              >
                                {formatFileSize(selectedFile.size)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2Icon
                                aria-hidden="true"
                                className="size-5"
                                style={{ color: "#16A34A" }}
                              />
                              <button
                                className="inline-flex items-center justify-center rounded-md p-1 transition-colors duration-150"
                                onClick={() => {
                                  field.handleChange(null);
                                  setSubmitError("");
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
                                }}
                                style={{
                                  color: "#0C4A6E",
                                  opacity: 0.5,
                                }}
                                type="button"
                              >
                                <XIcon className="size-4" />
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <FieldDescription>
                            Field yang dikirim: cv dan filename sebagai multipart
                            form data.
                          </FieldDescription>
                        )}
                      </AnimatePresence>
                      {submitError ? (
                        <FieldError>{submitError}</FieldError>
                      ) : null}
                    </Field>
                  </FieldGroup>
                );
              }}
            </form.Field>

            {submitError && !mutation.isPending ? (
              <Alert
                className="rounded-lg border"
                style={{
                  borderColor: "#FECACA",
                  backgroundColor: "#FEF2F2",
                  color: "#991B1B",
                }}
                variant="destructive"
              >
                <AlertCircleIcon
                  aria-hidden="true"
                  className="size-4"
                  style={{ color: "#DC2626" }}
                />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                className="w-full font-medium transition-colors duration-150 sm:w-auto"
                data-testid="submit-cv"
                disabled={mutation.isPending}
                size="lg"
                style={{
                  backgroundColor: "#0369A1",
                  color: "#FFFFFF",
                }}
                type="submit"
              >
                {mutation.isPending ? (
                  <>
                    <LoaderCircleIcon
                      aria-hidden="true"
                      className="animate-spin"
                      data-icon="inline-start"
                    />
                    Menganalisis CV...
                  </>
                ) : (
                  <>
                    <UploadIcon
                      aria-hidden="true"
                      data-icon="inline-start"
                    />
                    Analisis CV
                  </>
                )}
              </Button>
              <p
                className="text-sm"
                style={{ color: "#0C4A6E", opacity: 0.6 }}
              >
                Hasil tersimpan di database dan bisa dibuka lagi dari riwayat.
              </p>
            </div>
          </motion.form>
        )}
      </CardContent>
    </Card>
  );
}
