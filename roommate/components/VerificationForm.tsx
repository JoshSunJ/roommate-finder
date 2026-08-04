"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function VerificationForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(formData: FormData) { setLoading(true); setError(""); const response = await fetch("/api/verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ affiliationType: formData.get("affiliationType"), affiliationName: formData.get("affiliationName") }) }); if (!response.ok) { setError((await response.json()).error); setLoading(false); return; } router.refresh(); }
  return <form action={submit} className="auth-form"><label>Community role<select name="affiliationType" defaultValue="student"><option value="student">Student</option><option value="intern">Intern</option></select></label><label>School or company<input name="affiliationName" required placeholder="San José State University" /></label><p className="auth-form__hint">An administrator reviews this first version. Do not upload sensitive documents.</p>{error && <p className="form-error">{error}</p>}<button disabled={loading}>{loading ? "Submitting…" : "Submit for review"}</button></form>;
}
