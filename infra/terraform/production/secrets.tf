resource "google_secret_manager_secret" "application" {
  for_each = toset(values(local.secret_environment))

  project   = var.project_id
  secret_id = each.value

  replication {
    auto {}
  }

  depends_on = [google_project_service.required]
}

resource "google_secret_manager_secret_iam_member" "runtime_access" {
  for_each = google_secret_manager_secret.application

  project   = var.project_id
  secret_id = each.value.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_secret_manager_secret_iam_member" "deployment_access" {
  for_each = toset([
    local.required_secret_environment.DATABASE_URL,
    local.required_secret_environment.DIRECT_DATABASE_URL,
  ])

  project   = var.project_id
  secret_id = google_secret_manager_secret.application[each.value].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.deployment.email}"
}
