import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FileTextIcon,
  LoaderCircleIcon,
  UploadIcon,
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
import { Progress } from "@/shared/components/shadcn/ui/progress";
import { cn } from "@/shared/lib/utils";
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
    <Card className="min-w-0 w-full max-w-full overflow-hidden bg-card">
      <CardHeader className="border-b bg-card p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex flex-col gap-2">
            <p className="font-medium text-muted-foreground text-sm">
              CV Intake
            </p>
            <CardTitle className="text-2xl">Upload CV</CardTitle>
            <CardDescription className="max-w-xl leading-6">
              PDF, DOC, atau DOCX sampai 10MB. File masuk lewat endpoint
              internal CareerMatch sebelum diproses pipeline.
            </CardDescription>
          </div>
          <Badge className="bg-accent text-accent-foreground" variant="outline">
            10MB max
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="min-w-0 p-6 sm:p-7">
        <motion.form
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0 flex flex-col gap-5"
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
                        "relative flex min-h-[260px] w-full max-w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-lg border border-dashed bg-background p-6 text-center transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                        dragActive && "border-primary bg-muted",
                      )}
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
                      <span className="flex size-14 items-center justify-center rounded-lg border border-border bg-card text-primary">
                        <UploadIcon aria-hidden="true" />
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="font-medium text-lg">
                          Pilih CV atau tarik file ke sini
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Analisis berjalan setelah kamu menekan tombol submit.
                        </span>
                      </span>
                      <span className="absolute right-4 bottom-4 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground text-xs">
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
                    {selectedFile ? (
                      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                        <FileTextIcon
                          aria-hidden="true"
                          data-icon="inline-start"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-sm">
                            {selectedFile.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                        <CheckCircle2Icon
                          aria-hidden="true"
                          className="text-accent-foreground"
                        />
                      </div>
                    ) : (
                      <FieldDescription>
                        Field yang dikirim: cv dan filename sebagai multipart
                        form data.
                      </FieldDescription>
                    )}
                    {submitError ? (
                      <FieldError>{submitError}</FieldError>
                    ) : null}
                  </Field>
                </FieldGroup>
              );
            }}
          </form.Field>

          {mutation.isPending ? (
            <AnalysisPipeline activeStep={activeStep} />
          ) : null}

          {submitError && !mutation.isPending ? (
            <Alert variant="destructive">
              <AlertCircleIcon aria-hidden="true" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              className="w-full sm:w-auto"
              data-testid="submit-cv"
              disabled={mutation.isPending}
              size="lg"
              type="submit"
            >
              {mutation.isPending ? (
                <LoaderCircleIcon
                  aria-hidden="true"
                  className="animate-spin"
                  data-icon="inline-start"
                />
              ) : (
                <UploadIcon aria-hidden="true" data-icon="inline-start" />
              )}
              Analisis CV
            </Button>
            <p className="text-muted-foreground text-sm">
              Hasil tersimpan di database dan bisa dibuka lagi dari riwayat.
            </p>
          </div>
        </motion.form>
      </CardContent>
    </Card>
  );
}

function AnalysisPipeline({ activeStep }: { activeStep: number }) {
  const progress = ((activeStep + 1) / PIPELINE_STEPS.length) * 100;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 rounded-lg border bg-card p-4"
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.24 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-sm">Pipeline analisis berjalan</p>
          <p className="text-muted-foreground text-sm">
            Proses ini dapat memakan waktu sampai sekitar satu menit.
          </p>
        </div>
        <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
      </div>
      <Progress value={progress} />
      <ol className="flex flex-col gap-2">
        {PIPELINE_STEPS.map((step, index) => (
          <motion.li
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex items-center gap-2 text-sm",
              index <= activeStep ? "text-foreground" : "text-muted-foreground",
            )}
            initial={{ opacity: 0, x: -8 }}
            key={step}
            transition={{ delay: index * 0.03, duration: 0.2 }}
          >
            {index < activeStep ? (
              <CheckCircle2Icon aria-hidden="true" className="text-primary" />
            ) : (
              <span className="size-4 rounded-full border" />
            )}
            {step}
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}
