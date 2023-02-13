terraform {
  required_version = "~> 1.3.8"

  backend "gcs" {
    prefix      = "eckero-admin-api"
  }
}

provider "google" {
  credentials = "service_account_${var.environment}.json"
  project     = var.project
  region      = var.gcloud_region
}

provider "google-beta" {
  credentials = "service_account_${var.environment}.json"
  project     = var.project
  region      = var.gcloud_region
}

variable "gcloud_region" {
  type        = string
  description = "The Google Cloud region"
  default     = "europe-north1"
}

variable "project" {
  type        = string
  description = "Name of the Google Cloud project"
}

variable "environment" {
  type        = string
  description = "Name of the environment"
}
