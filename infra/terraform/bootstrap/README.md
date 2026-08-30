# Terraform state bootstrap

This root creates the private, versioned Google Cloud Storage bucket that holds
the production Terraform state. It intentionally uses local state because a
remote state bucket cannot store the operation that creates itself.

Run it once from a trusted workstation:

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan -out bootstrap.tfplan
terraform apply bootstrap.tfplan
```

Keep the generated local state private and backed up until the production root
has successfully initialized its remote backend. Never commit it.

