import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CrawlSchedule,
  ProjectHistoryEntry,
  UrlAuditResult,
} from "../backend.d";
import { useActor } from "./useActor";

export function useSiteHealthScore() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["siteHealthScore"],
    queryFn: async () => {
      if (!actor) return 0;
      const score = await (actor as any).getSiteHealthScore();
      return Number(score);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUrlAuditResults() {
  const { actor, isFetching } = useActor();
  return useQuery<UrlAuditResult[]>({
    queryKey: ["allUrlAuditResults"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllUrlAuditResults();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSchedules() {
  const { actor, isFetching } = useActor();
  return useQuery<CrawlSchedule[]>({
    queryKey: ["schedules"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getSchedules();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProjectHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<ProjectHistoryEntry[]>({
    queryKey: ["projectHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getProjectHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (schedule: CrawlSchedule) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).saveSchedule(schedule);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });
}

export function useDeleteSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteSchedule(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });
}

export function useToggleSchedule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).toggleSchedule(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedules"] }),
  });
}

export function useSaveProjectHistory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: ProjectHistoryEntry) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).saveProjectHistory(entry);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projectHistory"] }),
  });
}
