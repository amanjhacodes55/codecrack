import clsx from "clsx";
import { CheckCircle2, Clock, XCircle, AlertTriangle, FileEdit } from "lucide-react";

const STATUS: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", cls: "bg-surface-3 text-muted", icon: <FileEdit className="size-3.5" /> },
  pending: { label: "In review", cls: "bg-info-soft text-info", icon: <Clock className="size-3.5" /> },
  changes_requested: { label: "Changes requested", cls: "bg-warn-soft text-warn", icon: <AlertTriangle className="size-3.5" /> },
  rejected: { label: "Rejected", cls: "bg-danger-soft text-danger", icon: <XCircle className="size-3.5" /> },
  approved: { label: "Published", cls: "bg-brand-soft text-brand", icon: <CheckCircle2 className="size-3.5" /> },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] || STATUS.draft;
  return <span className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", s.cls)}>{s.icon} {s.label}</span>;
}

