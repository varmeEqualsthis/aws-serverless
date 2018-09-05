import * as AWS from "aws-sdk"
import {Promise as P} from "bluebird"
import fs from "fs"
import _ from "lodash"
import path from "path"
import {getAwsConsoleLoginUrlForRole, getPolicyNamesForRoleName, putPolicy} from "./iam-utils"

const putPolicyDocument = async () => {
    const policyDocumentPath = path.join(__dirname, "..", "..", "services",
        "project-iam", "policy-templates", "admin-policy.json")
    const putPolicyResponse =
    await putPolicyDocumentFromFile("project01-admin", policyDocumentPath)

    console.log(JSON.stringify(putPolicyResponse, null, 2))
}

const putPolicyDocumentFromFile = async (policyName: string, policyDocumentFile: string) => {
    const policyDocument = fs.readFileSync(policyDocumentFile, "utf8")
    return await putPolicy(policyName, policyDocument)
}

const syncPolicies = async () => {
    const policyTemplatesDirectory = path.join(__dirname, "..", "..", "services", "project-iam", "policy-templates")
    const policyDefinitions = [
        {
            policyName: "project01-admin",
            fileName: "admin-policy.json",
        },
        {
            policyName: "project01-api-gateway",
            fileName: "api-gateway-policy.json",
        },
        {
            policyName: "project01-lambda",
            fileName: "lambda-policy.json",
        },
        {
            policyName: "project01-stepfunction",
            fileName: "stepfunction-policy.json",
        },
        {
            policyName: "project01-kinesis-firehose",
            fileName: "firehose-policy.json",
        },
        {
            policyName: "project01-support",
            fileName: "support-policy.json",
        },
    ]

    return P.map(policyDefinitions, (policyDefinition) =>
        putPolicyDocumentFromFile(
            policyDefinition.policyName,
            path.join(policyTemplatesDirectory, policyDefinition.fileName),
        ),
        {concurrency: 1},
    )
}

const getPolicyNamesForRole = async () => {
    const iam = new AWS.IAM()
    const resp = await iam.listRoles().promise()

    const roleNames = resp.Roles.filter((role) => role.RoleName.match(/dmc/)).map((role) => role.RoleName)
    const policyNames = _.flattenDeep(await P.all(roleNames.map((roleName) => getPolicyNamesForRoleName(roleName))))
    console.log(JSON.stringify(roleNames, null, 2))
    console.log(JSON.stringify(policyNames, null, 2))
    // rolesNames.map((rolesName) => getPolicyNamesForRoleName(rolesName))
    // console.log(JSON.stringify(policyNames, null, 2))
}

// NOTE: cannot run this with root credentials.  set a non-root/IAM user profile
// e.g. AWS_PROFILE=project01-admin-01 ts-node index.ts
const getAwsConsoleLoginUrlForRoleExample = async () => {
    const roleArn = "arn:aws:iam::529276214230:role/project01-support-role"
    const roleSessionName = "support"
    const issuerUrl = "https://mysignin.internal.mycompany.com/"

    return getAwsConsoleLoginUrlForRole(roleArn, roleSessionName, issuerUrl)
}

(async () => {
    // putPolicyDocument()
    // const resp = await getAwsConsoleLoginUrlForRoleExample()
    const syncPoliciesResp = await syncPolicies()
    console.log(JSON.stringify(syncPoliciesResp, null, 2))

})()
