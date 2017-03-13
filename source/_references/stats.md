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

To get stats for specific days you can specify the startTime and endTime query parameters like so: 

```language-bash
curl -H Api-Key: $API_KEY -X GET 'https://api.rokka.io/stats/{organization}?startTime=2016-11-11&endTime=2017-01-01'
```

You can use just one or both. The startTime parameter defaults to 30 days ago, while the endTime parameter defaults to now.
Note: Starting time and ending time can not have the same value. 
