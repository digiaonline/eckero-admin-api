variable "github_owner" {
  type        = string
  description = "Name of Github repository owner organization"
}

variable "github_repository" {
  type        = string
  description = "Name of Github repository"
}

variable "branch_name" {
  type        = string
  description = "Name of Github branch"
}

resource "google_cloudbuild_trigger" "cloudbuild_trigger" {
  provider    = google-beta

  name        = "${var.service}-${var.environment}"
  description = "GitHub Repository Trigger ${var.github_owner}/${var.github_repository} (${var.branch_name})"

  github {
    owner = var.github_owner
    name  = var.github_repository
    push {
      branch = "^${var.branch_name}$"
    }
  }

  substitutions = {
    _APP_ENV       = var.environment
    _GCLOUD_REGION = var.gcloud_region
  }

  filename = "cloudbuild.yaml"
}

resource "google_cloudbuild_trigger" "cloudbuild_trigger_pull_request" {
  provider    = google-beta

  name        = "${var.service}-${var.environment}-pr"
  description = "GitHub Pull Request Trigger ${var.github_owner}/${var.github_repository} (${var.branch_name})"

  github {
    owner = var.github_owner
    name  = var.github_repository
    pull_request {
      branch          = "^${var.branch_name}$"
      comment_control = "COMMENTS_ENABLED_FOR_EXTERNAL_CONTRIBUTORS_ONLY"
    }
  }

  substitutions = {
    _APP_ENV       = var.environment
    _GCLOUD_REGION = var.gcloud_region
  }

  filename = "cloudbuild.pr.yaml"
}
