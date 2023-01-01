variable "domain_name" {}
variable "zone_id" {}

output "site_bucket_id" {
  value = aws_s3_bucket.site.id
}
