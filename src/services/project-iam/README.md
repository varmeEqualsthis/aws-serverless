# project-iam

## deploy

`npm run deploy`

## Generate IAM CF Stack

```sh
# generate standalone CF stack for IAM roles and policies
npm run create-iam-cf-template

# output CF template at `output/ce-rti-cloudformation-template-for-iam-roles-and-policies.json`
```

## `serverless.yml` notes

* change `custom.prefix` as appropriate for your project
* `variables.js` - this loads policy document JSON files from `policy-templates` and makes available for use in `serverless.yml`