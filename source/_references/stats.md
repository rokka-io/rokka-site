---
title: Stats
use: [references]
---

## Get traffic and storage stats for your organization

You can get stats for your organization, for the past 30 days, with the following call.

```language-bash
curl -H Api-Key: $API_KEY -X GET 'https://api.rokka.io/stats/{organization}'
```

## Specify the date range

To get stats for specific days you can specify the from and to query parameters like so: 

```language-bash
curl -H Api-Key: $API_KEY -X GET 'https://api.rokka.io/stats/{organization}?from=2016-11-11&to=2017-01-01'
```

You can use just one or both. The from parameter defaults to 30 days ago, while the to parameter defaults to now.
Note: Starting date and ending date can not have the same value. 
