# aws-serverless-project-template

this is a template for a project that will be deployed to a shared aws environment.  This ensure project isolation, consistent naming standards, and least priviledged access.

## Prerequisites

You must have a non-root AWS profile named "admin"

## Project Specific Configuration

Be sure to set project specific settings in [src/resources/provider.js](src/resources/provider.js) and [src/resources/standard-tags.yml](src/resources/standard-tags.yml)

## Creating IAM Roles and Policies for your project

see [src/services/project-iam/README.md](src/services/project-iam/README.md)

> NOTE: this is not neccessary for federated aws environment.  users are in the environment via federation and linkage to ActiveDirectory groups

## Serverless Service Example

see [src/services/real-time-bus](src/services/real-time-bus/README.md)

## Cloudwatch Logs Processing

see [src/services/cloudwatch-logs-processing](src/services/cloudwatch-logs-processing/README.md)

---

## Template Usage Steps

1. Update `awsSandboxAccountId` in `src/resources/provider.js` to point to you account
2. Update `prefix` in `src/resources/provider.js` to refer to your prefix.
3. Run `npm install` at project level
4. Update `serverless.yml` under `src/services/real-time-bus` to replace with your prefix in Eventsourcemapping.
5. `npm installed aws-env` in `src/services/project-iam` and `src/services/real-time-bus`
6. Run `npm run deploy` in `src/services/project-iam` first
7. Verify all necessary IAM policies and roles are created in console
8. Run `npm run deploy` in `src/services/real-time-bus`
9. Verify the resources in aws console to make sure all are installed.
