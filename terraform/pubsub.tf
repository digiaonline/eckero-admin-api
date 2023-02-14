resource "google_service_account" "admin_pubsub_service_account" {
  account_id   = "el-admin-pubsub-${var.environment}"
  display_name = "${var.service}-pubsub-${var.environment}"
}

resource "google_project_iam_member" "admin_pubsub_iam_cloud_run_invoker" {
  project = var.project
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.admin_pubsub_service_account.email}"
}

resource "google_pubsub_topic" "admin_scheduler_topic" {
  project = var.project
  name = "${var.service}-scheduler-pub-${var.environment}"

  message_storage_policy {
    allowed_persistence_regions = [
      var.gcloud_region,
    ]
  }
  message_retention_duration = "600s"
}

resource "google_pubsub_subscription" "admin_scheduler_subscription" {
  project = var.project
  name = "${var.service}-scheduler-sub-${var.environment}"
  topic = google_pubsub_topic.admin_scheduler_topic.name

  ack_deadline_seconds = 20
  message_retention_duration = "600s"

  push_config {
    push_endpoint = "${google_cloud_run_service.admin_api.status[0].url}/v1/cache/clear"

    oidc_token {
      service_account_email = google_service_account.admin_pubsub_service_account.email
      audience              = google_cloud_run_service.admin_api.status[0].url
    }
  }
}