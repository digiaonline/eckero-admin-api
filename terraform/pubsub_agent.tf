resource "google_project_service_identity" "pubsub_agent" {
  provider = google-beta
  project  = var.project
  service  = "pubsub.googleapis.com"
}
resource "google_project_iam_binding" "project_token_creator" {
  project = var.project
  role    = "roles/iam.serviceAccountTokenCreator"
  members = ["serviceAccount:${google_project_service_identity.pubsub_agent.email}"]
}