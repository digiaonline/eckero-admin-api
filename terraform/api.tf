variable "service" {
  type        = string
  description = "Name of the API service"
}

variable "image" {
  type        = string
  description = "Name of the docker image"
}

variable "tag" {
  type        = string
  description = "The docker image version"
}

variable "cpu" {
  type        = string
  description = "The docker container CPU limit"
}

variable "ram" {
  type        = string
  description = "The docker container RAM limit"
}

resource "google_service_account" "api_service_account" {
  account_id   = "${var.service}-${var.environment}"
  display_name = "${var.service}-${var.environment}"
}

resource "google_project_iam_member" "api_iam_cloud_run_viewer" {
  project = var.project
  role    = "roles/run.viewer"
  member  = "serviceAccount:${google_service_account.api_service_account.email}"
}

resource "google_project_iam_member" "api_iam_cloud_run_invoker" {
  project = var.project
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.api_service_account.email}"
}

resource "google_project_iam_member" "api_iam_secretmanager_secret_accessor" {
  project = var.project
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.api_service_account.email}"
}

resource "google_project_iam_member" "api_iam_datastore_user" {
  project = var.project
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.api_service_account.email}"
}

resource "google_cloud_run_service" "api" {
  name     = "${var.service}-${var.environment}"
  location = var.gcloud_region

  template {
    spec {
      containers {
        image = "${var.image}:${var.tag}"
        resources {
          limits = {
            cpu    = "${var.cpu}"
            memory = "${var.ram}"
          }
        }
      }
      service_account_name = google_service_account.api_service_account.email
    }
  }

  autogenerate_revision_name = true

  traffic {
    percent         = 100
    latest_revision = true
  }
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = google_cloud_run_service.api.location
  project     = google_cloud_run_service.api.project
  service     = google_cloud_run_service.api.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

output "api_url" {
  value = google_cloud_run_service.api.status[0].url
}
