# cloudwatch-logs-processing

send cloudwatch logs to elasticsearch.

## Configuration

set environment.FUNCTION_NAME_MATCH_PREFIX in `serverless.yml`

## How it works

CloudTrail emits events for CreateLogGroup and the subscribe function processes these events by subscribing a `ship-logs` lambda to any log group matching a specified pattern.

## Notes

* the authorization header (AWS4-HMAC-SHA256) has been commented out in [functions/ship-logs/handler.js](functions/ship-logs/handler.js).  This is to allow logs to be shipped to a public elasticsearch domain.
