variable "domain_name" {}
variable "alternative_domain_names" {}

output "site_bucket_id" {
  value = aws_s3_bucket.site.id
}
