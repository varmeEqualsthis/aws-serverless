import * as AWS from "aws-sdk"
import {Promise as P} from "bluebird"
import _ from "lodash"
import qs from "querystring"
import rp from "request-promise"

export const getPolicyNamesForRoleName = async (roleName: string) => {
    const iam = new AWS.IAM()
    const attachedRolePolicies = await iam.listAttachedRolePolicies({RoleName: roleName}).promise()
    const rolePolicies = await iam.listRolePolicies({RoleName: roleName}).promise()
    const attachedPolicyNames = (attachedRolePolicies.AttachedPolicies || []).map((p) => p.PolicyName)
    return P.resolve(_.flattenDeep(attachedPolicyNames.concat(rolePolicies.PolicyNames)))
}

export const putPolicy = async (policyName: string, policyDocument: string) => {
    const iam = new AWS.IAM()
    const listPoliciesResponse = await iam.listPolicies().promise()
    const matchedPolicies = listPoliciesResponse.Policies!.filter((p) => p.PolicyName === policyName)
    if (matchedPolicies.length > 1) {
        throw Error(`multiple policies (${matchedPolicies.length}) having name "${policyName}" found`)
    }

    if (matchedPolicies.length === 0) {
        // throw Error(`no policy having name "${policyName}" found`)
        const createPolicyResponse = await iam.createPolicy({
            PolicyName: policyName,
            PolicyDocument: policyDocument,
        }).promise()
        return P.resolve(createPolicyResponse)
    } else {
        const policy = matchedPolicies[0]
        const listPolicyVersionsResponse = await iam.listPolicyVersions({PolicyArn: policy.Arn!}).promise()

        // can only have 5 versions.  delete oldest if needed
        if (listPolicyVersionsResponse.Versions && listPolicyVersionsResponse.Versions.length > 4) {
            const oldestVersion = listPolicyVersionsResponse.Versions!.pop()
            const deletePolicyVersionResponse =
            await iam.deletePolicyVersion({PolicyArn: policy.Arn!, VersionId: oldestVersion!.VersionId!}).promise()
        }

        const createPolicyVersionResponse =
            await iam.createPolicyVersion({PolicyArn: policy.Arn!, PolicyDocument: policyDocument, SetAsDefault: true})
                .promise()

        return P.resolve(createPolicyVersionResponse)
    }

}

export const getAwsConsoleLoginUrlForRole = async (roleArn: string, roleSessionName: string, issuerUrl: string) => {

    const consoleUrl = "https://console.aws.amazon.com/"
    const signInUrl = "https://signin.aws.amazon.com/federation"

    const sts = new AWS.STS()
    const assumeRoleResp = await sts.assumeRole({
            RoleArn: roleArn,
            RoleSessionName: roleSessionName})
        .promise()

    const temporaryCredentials = {
            sessionId: assumeRoleResp.Credentials!.AccessKeyId,
            sessionKey: assumeRoleResp.Credentials!.SecretAccessKey,
            sessionToken: assumeRoleResp.Credentials!.SessionToken,
        }

    const signInParams = {
        Action: "getSigninToken",
        Session: JSON.stringify(temporaryCredentials),
    }

    const signInTokenTextResp = await rp({
        url: signInUrl,
        qs: signInParams,
    })

    const signInTokenResp = JSON.parse(signInTokenTextResp)

    const consoleParams = {
        Action: "login",
        Issuer: issuerUrl,
        Destination: consoleUrl,
        SigninToken: signInTokenResp.SigninToken,
    }

    const browserUrl = `${signInUrl}?${qs.stringify(consoleParams)}`

    return P.resolve(browserUrl)
}
