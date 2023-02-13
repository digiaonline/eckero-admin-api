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

resource "google_service_account" "admin_api_service_account" {
  account_id   = "el-admin-api-${var.environment}"
  display_name = "${var.service}-${var.environment}"
}

resource "google_project_iam_member" "admin_api_iam_cloud_run_invoker" {
  project = var.project
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.admin_api_service_account.email}"
}

resource "google_project_iam_member" "admin_api_iam_service_account_user" {
  project = var.project
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.admin_api_service_account.email}"
}

resource "google_project_iam_member" "admin_api_iam_secretmanager_secret_accessor" {
  project = var.project
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.admin_api_service_account.email}"
}

resource "google_project_iam_member" "admin_api_iam_datastore_user" {
  project = var.project
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.admin_api_service_account.email}"
}

resource "google_cloud_run_service" "admin_api" {
  name     = "${var.service}-${var.environment}"
  location = var.gcloud_region

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "1"
        "run.googleapis.com/vpc-access-connector" = "vpc-connector-${var.environment}"
      }
    }
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
      service_account_name = google_service_account.admin_api_service_account.email
    }
  }

  autogenerate_revision_name = true

  traffic {
    percent         = 100
    latest_revision = true
  }

  metadata {
    annotations = {
      "run.googleapis.com/ingress" = "internal"
    }
  }
}

output "admin_api_url" {
  value = google_cloud_run_service.admin_api.status[0].url
}
