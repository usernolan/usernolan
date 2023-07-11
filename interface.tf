variable "domain_name" {}
variable "alternative_domain_names" {}
variable "dns_records" {
  type = list(object({
    domain_name = string
    name        = optional(string)
    type        = string
    ttl         = number
    records     = list(string)
  }))
}

output "site_bucket_id" {
  value = aws_s3_bucket.site.id
}
