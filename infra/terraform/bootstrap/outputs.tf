output "state_bucket_name" {
  description = "Bucket to pass to the production terraform init command."
  value       = google_storage_bucket.terraform_state.name
}

