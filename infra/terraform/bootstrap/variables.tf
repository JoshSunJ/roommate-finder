variable "project_id" {
  description = "Google Cloud project that owns Unitern production infrastructure."
  type        = string
}

variable "region" {
  description = "Region for the Terraform state bucket."
  type        = string
  default     = "us-west1"
}

variable "state_bucket_name" {
  description = "Globally unique Google Cloud Storage bucket name for Terraform state."
  type        = string
}

