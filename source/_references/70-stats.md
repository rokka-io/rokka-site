---
title: Stats
use: [references]
descriptions: All about rokka stats like traffic and storage space.

---

## Get traffic and storage stats for your organization

You can get stats for your organization, over the past 30 days and including today, with the following call.

```language-bash
curl -H Api-Key: $API_KEY -X GET 'https://api.rokka.io/stats/{organization}'
```

## Specify the date range

To get stats for specific days you can specify the from and to query parameters. 

```language-bash
curl -H Api-Key: $API_KEY -X GET 'https://api.rokka.io/stats/{organization}?from=2016-12-01&to=2016-12-31'
```

You can use just one or both. The from parameter defaults to 30 days ago, while the to parameter defaults to today. Both
parameters work inclusively, so if you enter the same date in both, you get the stats for just that one day.

The date format is always Year-Month-Day, with leading zeros.
