# eckero-admin-api-devops

Eckerö Line Admin API DevOps

This folder contains the [Terraform](https://www.terraform.io/) scripts needed to create and manage environments for the Eckerö Line admin API.

## How it works

All the resources needed to run the project on Google Cloud are defined as separate TF files in this directory.

- `main.tf`      contains the required configuration for Terraform to be able to manage the resources
- `api.tf`       contains the [Cloud Run](https://cloud.google.com/run) definition with required service account and policies to run the API
- `api_cache.tf` contains the [Memorystore](https://cloud.google.com/memorystore) definition for a Redis cache instance used by the API
- `api_ci.tf`    contains the [Cloud Build](https://cloud.google.com/cloud-build) Github trigger and runs new builds using [cloudbuild.yaml](../cloudbuild.yaml)
- `env_*.tfvars` contains the environment variables for Terraform to use
- `gcs_*.hcl`    contains the Terraform backend config for the environment, i.e. GCP bucket and service account

## How do I use it?

Prerequisites:

- Access to the Google Cloud Account
- Install `terraform` on your machine (version defined in `main.tf`)
- Get the `terraform` service account key from a developer or create a new key-pair in GCP and place it in `./terraform/service_account_{env}.json` (keep this safe and secure!)

Now you should have the access required to run terraform.

When making changes to the infrastructure you should use the following commands:

- `terraform init -reconfigure -backend-config=gcs_{env}.hcl` initial setup (also required when terraform tells you to run it)
- `terraform workspace select {env}`                          select the workspace that match the environment you want to modify (options: staging, production)
- `terraform plan -var-file env_{env}.tfvars`                 dry-run to test and verify what is going to be modified (safe to run at any time)
- `terraform apply -var-file env_{env}.tfvars`                applies the changes to Google Cloud (will ask you to verify the action)

## How do I create a new environment?

There are a few things you need to do in GCP when creating new environments:

- Make sure you have enough access rights to create the neccessary resources to be able to use Terraform for setting up the environment. At the moment those resources require the `roles/owner` access right for the GCP project. An alternative approach is to request the resources to be created on your behalf by someone else.
- Create a new service account named `terraform` with a new key-pair and copy the private key into `./terraform/service_account_{env}.json` (keep this safe and secure!), including these permissions:
  - Cloud Run Admin
  - Cloud Build Editor
  - Cloud Datastore Index Admin
  - Cloud Memorystore Redis Admin
  - Security Admin
  - Create Service Accounts
  - Service Account User
  - Storage Object Admin
  - Serverless VPC Access Admin
- Create a new private storage bucket named `eckero-admin-api-terraform-{env}` in region `europe-north1` that will host the Terraform state files
- Enable the following APIs
  - Container Registry API
  - Cloud Run API
  - Cloud Logging API
  - Cloud Build API
  - Cloud Datastore API
  - Secret Manager API
  - Compute Engine API
  - Google Cloud Memorystore for Redis API
  - Cloud Resource Manager API
  - Serverless VPC Access API
- Create a new Cloud Firestore in Datastore mode in region `europe-west3` (Frankfurt)
- Upload the initial Docker image of the api to Container Registry
  - Verify that you have configured [authentication](https://cloud.google.com/container-registry/docs/advanced-authentication) to Container Registry.
  - Tag the image `docker tag {source} eu.gcr.io/{project}/eckero-admin-api`
  - And finally push the image `docker push eu.gcr.io/{project}/eckero-admin-api`
- Go to Cloud Build and Connect the Github repository (Triggers will be created by Terraform later)
- Follow the steps in the previous section "How do I use it?" to initialize Terraform and create the new environment
- At this point you should have a fully working environment set up in GCP and new commits on the Github repostiories should automatically be deployed as per the `cloudbuild.yml` file in the root of this repository. You only need to use Terraform when you need to add/modify/delete resources in GCP.
- The `terraform` service account can at this point be disabled in GCP to prevent any unintended access.

Some of these steps can be automated in the future if need be.
