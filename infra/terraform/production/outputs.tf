output "environment_name" {
  description = "Deployment environment represented by this Terraform state."
  value       = var.environment_name
}

output "artifact_registry_repository" {
  description = "Regional Docker repository used by the release workflow."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.application.repository_id}"
}

output "container_image_prefix" {
  description = "Prefix for Git-SHA image tags."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.application.repository_id}/${local.image_name}"
}

output "application_url" {
  description = "Canonical application origin configured in Auth.js."
  value       = local.application_url
}

output "cloud_run_url" {
  description = "Cloud Run-reported URL after deploy_application is enabled."
  value       = var.deploy_application ? google_cloud_run_v2_service.web[0].uri : null
}

output "workload_identity_provider" {
  description = "GitHub Actions auth workload_identity_provider value."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "deployment_service_account" {
  description = "GitHub Actions auth service_account value."
  value       = google_service_account.deployment.email
}

output "secret_ids" {
  description = "Secret containers that require values before application deployment."
  value       = sort(values(local.secret_environment))
}
