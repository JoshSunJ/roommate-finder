import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ModerationReviewActions from "@/components/ModerationReviewActions";
import { getModerationReports } from "@/features/moderation/service";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/current-user";

export default async function ReportsAdminPage() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) redirect("/");
  const reports = await getModerationReports();
  return <><Navbar /><main className="page-shell inbox-page"><p className="eyebrow">Administrator workspace</p><h1>Moderation reports</h1><p className="form-intro">Taking action hides the reported listing or request. Dismissing preserves it. Every decision records the administrator and time.</p><div className="inquiry-list">{reports.length === 0 ? <p className="empty-state">No reports submitted.</p> : reports.map((report) => { const href = report.targetType === "listing" ? `/listings/${report.targetId}` : `/requests/${report.targetId}`; return <article key={report.id}><p className="eyebrow">{report.status} · {report.reason}</p><h2>{report.targetType.replace("_", " ")} #{report.targetId}</h2><p>{report.details || "No additional details supplied."}</p><p>Reported by {report.reporter.name} ({report.reporter.email})</p><Link href={href}>Inspect reported item ↗</Link>{report.status === "pending" ? <ModerationReviewActions reportId={report.id} /> : <p>Reviewed by {report.reviewer?.name ?? "administrator"}{report.moderatorNote ? ` · ${report.moderatorNote}` : ""}</p>}</article>; })}</div></main></>;
}
