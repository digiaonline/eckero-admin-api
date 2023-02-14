resource "google_service_account" "admin_scheduler_service_account" {
  account_id   = "el-admin-scheduler-${var.environment}"
  display_name = "${var.service}-scheduler-${var.environment}"
}

resource "google_project_iam_member" "admin_scheduler_iam_pubsub_publisher" {
  project = var.project
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.admin_scheduler_service_account.email}"
}

resource "google_cloud_scheduler_job" "admin_scheduler_clear_cache" {
  name        = "${var.service}-scheduler-clear-cache-${var.environment}"
  region      = "europe-west3" # (Frankfurt) as cloud schedulers are not yet available in europe-north1
  schedule    = "0 0 * * *" # Every day at midnight

  time_zone        = "Europe/Helsinki"
  attempt_deadline = "1800s"

  retry_config {
    retry_count = 1
  }

  pubsub_target {
    topic_name = google_pubsub_topic.admin_scheduler_topic.id

    attributes = {
      x-goog-version = "v1"
    }
  }
}
