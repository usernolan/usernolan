terraform {
  required_version = "~> 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_acm_certificate" "site" {
  domain_name               = var.domain_name
  validation_method         = "DNS"
  subject_alternative_names = var.alternative_domain_names
}

resource "aws_route53_zone" "site" {
  for_each = toset(aws_acm_certificate.site.domain_validation_options[*].domain_name)
  name     = each.key
}

locals {
  zones = {
    for z in aws_route53_zone.site : z.name => z
  }
}

resource "aws_route53domains_registered_domain" "domains" {
  for_each    = toset(keys(local.zones))
  domain_name = each.key

  # `for_each` doesn't work here
  name_server { name = local.zones[each.key].name_servers[0] }
  name_server { name = local.zones[each.key].name_servers[1] }
  name_server { name = local.zones[each.key].name_servers[2] }
  name_server { name = local.zones[each.key].name_servers[3] }
}

/* NOTE: cache-control policy */
resource "aws_route53_record" "site_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = local.zones[each.key].zone_id
}

resource "aws_acm_certificate_validation" "cert" {
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for record in aws_route53_record.site_cert_validation : record.fqdn]
}

resource "aws_s3_bucket" "site" {
  bucket = var.domain_name
}

resource "aws_s3_bucket_acl" "site" {
  bucket = aws_s3_bucket.site.id
  acl    = "public-read"
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_cloudfront_distribution" "site" {
  depends_on       = [aws_acm_certificate_validation.cert]
  retain_on_delete = true

  origin {
    domain_name = aws_s3_bucket_website_configuration.site.website_endpoint
    origin_id   = "S3-Website-${aws_s3_bucket_website_configuration.site.website_endpoint}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"

      origin_ssl_protocols = [
        "TLSv1",
        "TLSv1.1",
        "TLSv1.2",
      ]
    }
  }

  aliases         = keys(local.zones)
  is_ipv6_enabled = true
  enabled         = true

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.site.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.1_2016"
  }

  default_cache_behavior {
    target_origin_id       = "S3-Website-${aws_s3_bucket_website_configuration.site.website_endpoint}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      cookies {
        forward = "none"
      }

      query_string = false
    }

    min_ttl     = 0
    max_ttl     = 31536000
    default_ttl = 86400
    compress    = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

resource "aws_route53_record" "site" {
  for_each = local.zones
  name     = each.key
  type     = "A"
  zone_id  = each.value.zone_id

  alias {
    evaluate_target_health = false
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
  }
}

resource "aws_route53_record" "dns_records" {
  for_each = {
    for r in var.dns_records : sha256(join("", r.records)) => r
  }
  name    = each.value.name == null ? each.value.domain_name : each.value.name
  type    = each.value.type
  ttl     = each.value.ttl
  zone_id = local.zones[each.value.domain_name].zone_id
  records = each.value.records
}
