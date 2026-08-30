resource "google_billing_budget" "production" {
  count = var.create_budget ? 1 : 0

  billing_account = var.billing_account_id
  display_name    = "Unitern production monthly budget"

  budget_filter {
    projects = ["projects/${data.google_project.current.number}"]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = tostring(var.monthly_budget_usd)
    }
  }

  dynamic "threshold_rules" {
    for_each = toset([0.5, 0.9, 1.0])

    content {
      threshold_percent = threshold_rules.value
      spend_basis       = "CURRENT_SPEND"
    }
  }

  lifecycle {
    precondition {
      condition     = var.billing_account_id != ""
      error_message = "billing_account_id is required when create_budget is true."
    }
  }

  depends_on = [google_project_service.required]
}

