import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { FileSearchIcon } from "lucide-react";

import {
  deleteAnalysisResultRequest,
  fetchAnalysisResult,
} from "@/features/cv-analysis/api-client";
import { AnalysisResultView } from "@/features/cv-analysis/components/AnalysisResultView";
import { Button } from "@/shared/components/shadcn/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/components/shadcn/ui/empty";
import { Skeleton } from "@/shared/components/shadcn/ui/skeleton";

interface AnalysisDetailContainerProps {
  analysisId: string;
}

export function JobseekerAnalysisDetailContainer({
  analysisId,
}: AnalysisDetailContainerProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const shouldReduceMotion = useReducedMotion();
  const resultQuery = useQuery({
    queryFn: () => fetchAnalysisResult(analysisId),
    queryKey: ["analysis-result", analysisId],
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteAnalysisResultRequest(analysisId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["analysis-history"] });
    },
  });

  function handleReset() {
    void deleteMutation.mutateAsync().finally(() => {
      void navigate({ to: "/jobseeker/dashboard" });
    });
  }

  return (
    <main className="paper-grid min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {resultQuery.isPending ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : resultQuery.data ? (
          <AnalysisResultView onReset={handleReset} result={resultQuery.data} />
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.28 }}
          >
            <Empty className="border border-border bg-card">
              <FileSearchIcon aria-hidden="true" />
              <EmptyHeader>
                <EmptyTitle>Hasil analisis tidak ditemukan</EmptyTitle>
                <EmptyDescription>
                  Hasil ini tidak ada di database atau kamu tidak memiliki akses
                  ke analisis tersebut.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  nativeButton={false}
                  render={<Link to="/jobseeker/dashboard" />}
                >
                  Buka dashboard
                </Button>
              </EmptyContent>
            </Empty>
          </motion.div>
        )}
      </div>
    </main>
  );
}
