# Terraform state bootstrap

This root creates the private, versioned Google Cloud Storage bucket that holds
the production Terraform state. It intentionally uses local state because a
remote state bucket cannot store the operation that creates itself.

Before running Terraform with local user credentials, authenticate both the
Google Cloud CLI and Application Default Credentials, then assign the target
project as the quota project:

```bash
gcloud auth login
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
```

The bootstrap also enables Cloud Resource Manager. The main Terraform root
uses user-project quota attribution so API usage belongs to the Unitern project
rather than the Google-owned project associated with the CLI OAuth client.

Run it once from a trusted workstation:

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan -out bootstrap.tfplan
terraform apply bootstrap.tfplan
```

Keep the generated local state private and backed up until the production root
has successfully initialized its remote backend. Never commit it.
