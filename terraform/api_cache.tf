resource "google_vpc_access_connector" "connector" {
  name          = "vpc-connector-${var.environment}"
  region        = var.gcloud_region
  ip_cidr_range = "10.8.0.0/28"
  network       = "default"
}

resource "google_redis_instance" "cache" {
  name           = "${var.service}-${var.environment}"
  region         = var.gcloud_region
  tier           = "BASIC"
  redis_version  = "REDIS_5_0"
  memory_size_gb = 1
}
