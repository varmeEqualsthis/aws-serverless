# data-exchange

example serverless service

## deploy

`npm run deploy`

## test

```sh
sls invoke --function runDataPipelineHiveScript --path events/runDataPipelineHiveScript.json

AWS_PROFILE=cfa-admin-01 sls invoke --function publishPirToIRMS --data '{"error": true, "data": "forced error"}' --type Event

```

## TODO

* add cloudwatch alarms to lambdas (`error count > 1`)
    * e.g. arn `arn:aws:cloudwatch:us-east-1:529276214230:alarm:cfa-med-info-dev-publishPirToIRMS-lambda-errors`
* create CF template with all policies and roles. provide this to cloud services
* research IP whitelist for API Gateway endpoint for inbound from salesforce (aws:SourceIp)
    * see <https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html#Conditions_IPAddress>
* add tags to serverless.yml for resources that support it
    * for unsupported, see if they can be added via `Resources:`


## Notes

* reason for lambda:DeleteEventSourceMapping on * (no cfa prefix in arn)
    ```
    An error occurred: AllEventsStreamHandlerEventSourceMappingKinesisCfamedinfodevallevents - User: arn:aws:iam::529276214230:user/cfa-admin-01 is not authorized to perform: lambda:DeleteEventSourceMapping on resource: arn:aws:lambda:us-east-1:529276214230:event-source-mapping:44928fab-6025-40e6-8866-b11e662d488d.
    ```