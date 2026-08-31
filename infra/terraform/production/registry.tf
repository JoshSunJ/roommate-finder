resource "google_artifact_registry_repository" "application" {
  project       = var.project_id
  location      = var.region
  repository_id = local.artifact_repository
  description   = "Immutable Unitern application containers"
  format        = "DOCKER"

  cleanup_policies {
    id     = "keep-recent-releases"
    action = "KEEP"

    most_recent_versions {
      keep_count = 10
    }
  }

  cleanup_policies {
    id     = "delete-old-untagged-images"
    action = "DELETE"

    condition {
      tag_state  = "UNTAGGED"
      older_than = "604800s"
    }
  }

  depends_on = [google_project_service.required]
}

