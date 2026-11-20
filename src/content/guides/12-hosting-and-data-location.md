---
title: Hosting and data location
slug: hosting-and-data-location
description: Where rokka is hosted on AWS (Amazon Web Services), in which regions and data centers your images and metadata are stored, and how they are delivered

---

rokka is hosted on **Amazon Web Services (AWS)**. Its primary region is **Frankfurt, Germany (AWS region `eu-central-1`)**, with a replica in **Ireland (`eu-west-1`)**. Both are in the EU. rokka itself is operated by Liip AG in Zürich, Switzerland.

## Where your data is stored

| What | Where |
| --- | --- |
| API and image rendering servers | Frankfurt (`eu-central-1`) |
| Source images (your uploaded originals) | Amazon S3 in Frankfurt, replicated to Ireland (`eu-west-1`) |
| Metadata (organizations, stacks, source image metadata, users) | Amazon DynamoDB in Frankfurt, replicated to Ireland |
| Rendered images (the origin cache) | Amazon S3 and memcached in Frankfurt |
| Search index (for [searching source images](../references/searching-images.html)) | Elasticsearch on Elastic Cloud, hosted on AWS in Frankfurt |

The copies in Ireland serve as backup and as a standby in case the Frankfurt region fails. Additional backups are kept in a separate AWS account in Paris (`eu-west-3`).

## Delivery of rendered images

Rendered images are delivered to your users through the **Amazon CloudFront** CDN, which caches them on edge servers worldwide, close to wherever your visitors are. Your originals and metadata stay in the regions above; only the rendered images your visitors request are cached at the edges. For some video setups, streaming segments are delivered through the [bunny.net](https://bunny.net/) CDN instead.

## Optional features that use other services

Two features send image data to a service outside the Frankfurt region. Both only run when you ask for them:

- **Face detection** ([dynamic metadata](../references/dynamic-metadata.html)) uses AWS Rekognition in Ireland (`eu-west-1`).
- **[Auto descriptions](../references/auto-descriptions.html)** (AI-generated alt text) send the image to OpenAI's API, which is not hosted by rokka on AWS.

## Questions

If you need more details for a data protection review, a contract or a data processing agreement, [contact us](https://rokka.io/en/contact/).
