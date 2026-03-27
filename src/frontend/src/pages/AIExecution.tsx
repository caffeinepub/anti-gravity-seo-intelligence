import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Pause, Play, RotateCcw, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

const aiRecommendations = [
  {
    title: "Optimize 47 Meta Descriptions",
    impact: "High",
    effort: "Low",
    estimatedTraffic: "+12%",
    category: "On-Page",
  },
  {
    title: "Fix 8 Broken Internal Links",
    impact: "Critical",
    effort: "Low",
    estimatedTraffic: "+5%",
    category: "Technical",
  },
  {
    title: "Add Schema Markup to 23 Pages",
    impact: "High",
    effort: "Medium",
    estimatedTraffic: "+18%",
    category: "Schema",
  },
  {
    title: "Build 50 High-Authority Backlinks",
    impact: "High",
    effort: "High",
    estimatedTraffic: "+24%",
    category: "Off-Page",
  },
  {
    title: "Improve Page Speed for 12 Pages",
    impact: "Medium",
    effort: "Medium",
    estimatedTraffic: "+8%",
    category: "Technical",
  },
];

export function AIExecution() {
  const { actor, isFetching } = useActor();
  const [engineStatus, setEngineStatus] = useState<"running" | "paused">(
    "running",
  );
  const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({});
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [planDescription, setPlanDescription] = useState("");
  const [queuedRecs, setQueuedRecs] = useState<Set<string>>(new Set());

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["aiTasks"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllAiTasks();
      } catch (err) {
        console.error("[AIExecution][getAllAiTasks] Error:", err);
        toast.error("Failed to load AI tasks");
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const taskList = (tasks ?? []).map((t) => ({
    ...t,
    completion: Number(t.completion),
    priority: Number(t.priority),
  }));

  const statusColor = (s: string) =>
    ({
      completed: "#2EE38B",
      running: "#2AA9FF",
      queued: "#8FA3B8",
      failed: "#FF4D4D",
    })[s] ?? "#8FA3B8";
  const statusBg = (s: string) =>
    ({
      completed: "rgba(46,227,139,0.12)",
      running: "rgba(42,169,255,0.12)",
      queued: "rgba(255,255,255,0.06)",
      failed: "rgba(255,77,77,0.12)",
    })[s] ?? "rgba(255,255,255,0.06)";
  const impactColor = (s: string) =>
    ({ Critical: "#FF4D4D", High: "#FFC107", Medium: "#2AA9FF" })[s] ??
    "#8FA3B8";

  const getTaskStatus = (task: { id: string; status: string }) =>
    taskStatuses[task.id] ?? task.status;

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const resolvedStatus = taskStatuses[taskId] ?? currentStatus;
    const newStatus = resolvedStatus === "running" ? "paused" : "running";
    setTaskStatuses((prev) => ({ ...prev, [taskId]: newStatus }));
    toast.success(
      newStatus === "running"
        ? `Task ${taskId} resumed`
        : `Task ${taskId} paused`,
    );
  };

  const handleSubmitPlan = () => {
    if (!planDescription.trim()) {
      toast.error("Enter a plan description");
      return;
    }
    toast.success("Plan submitted for execution");
    setPlanDescription("");
    setShowNewPlanModal(false);
  };

  const displayTaskList = taskList.map((t) => ({
    ...t,
    status: taskStatuses[t.id] ?? t.status,
  }));

  return (
    <div className="space-y-5">
      {/* Execution controls */}
      <div className="card-seo p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold" style={{ color: "#EAF1FF" }}>
              Autonomous Execution Engine
            </h3>
            <p className="text-xs mt-1" style={{ color: "#8FA3B8" }}>
              AI-powered SEO tasks running autonomously in the background
            </p>
            <span
              className="text-xs mt-1 inline-block px-2 py-0.5 rounded"
              style={{
                background:
                  engineStatus === "running"
                    ? "rgba(42,169,255,0.12)"
                    : "rgba(255,193,7,0.12)",
                color: engineStatus === "running" ? "#2AA9FF" : "#FFC107",
              }}
            >
              Engine: {engineStatus === "running" ? "Running" : "Paused"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="ai.primary_button"
              onClick={() => {
                setEngineStatus("running");
                toast.success("Engine resumed");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                background: "rgba(46,227,139,0.12)",
                border: "1px solid rgba(46,227,139,0.25)",
                color: "#2EE38B",
              }}
            >
              <Play size={13} /> Resume
            </button>
            <button
              type="button"
              data-ocid="ai.secondary_button"
              onClick={() => {
                setEngineStatus("paused");
                toast.success("All tasks paused");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                background: "rgba(255,193,7,0.12)",
                border: "1px solid rgba(255,193,7,0.25)",
                color: "#FFC107",
              }}
            >
              <Pause size={13} /> Pause All
            </button>
            <button
              type="button"
              data-ocid="ai.open_modal_button"
              onClick={() => setShowNewPlanModal(true)}
              className="btn-primary-seo flex items-center gap-1.5 px-4 py-2 text-sm"
            >
              <Zap size={13} /> Execute New Plan
            </button>
          </div>
        </div>

        {/* New Plan Modal */}
        {showNewPlanModal && (
          <div
            data-ocid="ai.modal"
            className="mt-4 p-4 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(42,169,255,0.3)",
            }}
          >
            <h4
              className="text-sm font-semibold mb-3"
              style={{ color: "#EAF1FF" }}
            >
              New Execution Plan
            </h4>
            <textarea
              data-ocid="ai.textarea"
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              placeholder="Describe the SEO plan to execute..."
              className="w-full p-2 rounded text-sm resize-none"
              rows={3}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#EAF1FF",
                outline: "none",
              }}
            />
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                data-ocid="ai.submit_button"
                onClick={handleSubmitPlan}
                className="btn-primary-seo px-4 py-1.5 text-xs"
              >
                Submit Plan
              </button>
              <button
                type="button"
                data-ocid="ai.cancel_button"
                onClick={() => {
                  setShowNewPlanModal(false);
                  setPlanDescription("");
                }}
                className="px-4 py-1.5 text-xs rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#8FA3B8",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Progress summary */}
        <div className="grid grid-cols-4 gap-4 mt-5">
          {[
            {
              label: "Running",
              value: displayTaskList.filter((t) => t.status === "running")
                .length,
              color: "#2AA9FF",
            },
            {
              label: "Queued",
              value: displayTaskList.filter((t) => t.status === "queued")
                .length,
              color: "#8FA3B8",
            },
            {
              label: "Completed",
              value: displayTaskList.filter((t) => t.status === "completed")
                .length,
              color: "#2EE38B",
            },
            {
              label: "Failed",
              value: displayTaskList.filter((t) => t.status === "failed")
                .length,
              color: "#FF4D4D",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg p-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs" style={{ color: "#6F839A" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task queue */}
      <div className="card-seo p-5">
        <h3
          className="text-xs font-bold uppercase tracking-wider mb-4"
          style={{ color: "#8FA3B8" }}
        >
          Execution Queue
        </h3>
        {isLoading ? (
          <div data-ocid="ai.loading_state" className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-10 w-full rounded"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        ) : displayTaskList.length === 0 ? (
          <div data-ocid="ai.empty_state" className="py-12 text-center">
            <Zap size={28} style={{ color: "#8FA3B8", margin: "0 auto 8px" }} />
            <p className="text-sm font-medium" style={{ color: "#EAF1FF" }}>
              No AI tasks running
            </p>
            <p className="text-xs mt-1" style={{ color: "#6F839A" }}>
              Run an SEO audit first to generate automated tasks, or create a
              new execution plan above.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  "ID",
                  "Task",
                  "Status",
                  "Priority",
                  "URL",
                  "Progress",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-2 text-xs font-medium"
                    style={{ color: "#6F839A" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayTaskList.map((task, i) => (
                <tr
                  key={task.id}
                  data-ocid={`ai.item.${i + 1}`}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td
                    className="py-3 text-xs font-mono"
                    style={{ color: "#6F839A" }}
                  >
                    {task.id}
                  </td>
                  <td className="py-3 text-sm" style={{ color: "#EAF1FF" }}>
                    {task.taskType}
                  </td>
                  <td className="py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                      style={{
                        background: statusBg(task.status),
                        color: statusColor(task.status),
                      }}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className="text-xs"
                      style={{
                        color:
                          task.priority === 1
                            ? "#FF4D4D"
                            : task.priority === 2
                              ? "#FFC107"
                              : "#8FA3B8",
                      }}
                    >
                      P{task.priority}
                    </span>
                  </td>
                  <td className="py-3 text-xs" style={{ color: "#8FA3B8" }}>
                    {task.affectedUrl}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1.5 w-20 rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${task.completion}%`,
                            background:
                              task.status === "failed"
                                ? "#FF4D4D"
                                : task.status === "completed"
                                  ? "#2EE38B"
                                  : "#2AA9FF",
                          }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: "#6F839A" }}>
                        {task.completion}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      data-ocid={`ai.toggle.${i + 1}`}
                      onClick={() => handleToggleTask(task.id, task.status)}
                      className="p-1 rounded hover:bg-white/5 transition-colors"
                      title={
                        getTaskStatus(task) === "running"
                          ? "Pause task"
                          : "Resume task"
                      }
                    >
                      {getTaskStatus(task) === "running" ? (
                        <Pause size={12} style={{ color: "#FFC107" }} />
                      ) : (
                        <RotateCcw size={12} style={{ color: "#8FA3B8" }} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="card-seo p-5">
        <h3
          className="text-xs font-bold uppercase tracking-wider mb-4"
          style={{ color: "#8FA3B8" }}
        >
          AI Recommendations
        </h3>
        <div className="space-y-3">
          {aiRecommendations.map((rec) => (
            <div
              key={rec.title}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-3">
                <Zap size={14} style={{ color: impactColor(rec.impact) }} />
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "#EAF1FF" }}
                  >
                    {rec.title}
                  </div>
                  <div className="text-xs" style={{ color: "#6F839A" }}>
                    {rec.category} &bull; Effort: {rec.effort}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-bold"
                  style={{ color: "#2EE38B" }}
                >
                  {rec.estimatedTraffic}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-xs"
                  style={{
                    background: `${impactColor(rec.impact)}18`,
                    color: impactColor(rec.impact),
                  }}
                >
                  {rec.impact}
                </span>
                <button
                  type="button"
                  data-ocid="ai.secondary_button"
                  onClick={() => {
                    setQueuedRecs((prev) => {
                      const next = new Set(prev);
                      if (next.has(rec.title)) {
                        next.delete(rec.title);
                        toast.success("Removed from queue");
                      } else {
                        next.add(rec.title);
                        toast.success(
                          `"${rec.title}" added to execution queue`,
                        );
                      }
                      return next;
                    });
                  }}
                  className="px-3 py-1 rounded text-xs font-medium transition-all"
                  style={{
                    background: queuedRecs.has(rec.title)
                      ? "rgba(46,227,139,0.15)"
                      : "rgba(42,169,255,0.15)",
                    color: queuedRecs.has(rec.title) ? "#2EE38B" : "#2AA9FF",
                    border: queuedRecs.has(rec.title)
                      ? "1px solid rgba(46,227,139,0.25)"
                      : "1px solid rgba(42,169,255,0.25)",
                  }}
                >
                  {queuedRecs.has(rec.title) ? "Queued ✓" : "Queue"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
