module.exports.project = () => {
  // personal
  const awsSandboxAccountId = "900319245181";
  const awsSandboxEnvironmentName = "personal";
  const awsAccountId = awsSandboxAccountId;
  const environmentName = awsSandboxEnvironmentName;

  // MerckModernCloud
  //const awsAccountId = "780502391271"
  //const environmentName = "MerckModernCompute"

  const prefix = "ce-rti";
  return {
    awsAccountId,
    isSandboxAccount: awsSandboxEnvironmentName === environmentName,
    environmentName,
    prefix,
    lambdaRole: `arn:aws:iam::${awsAccountId}:role/${prefix}-lambda-role`,
    stepfunctionRole: `arn:aws:iam::${awsAccountId}:role/${prefix}-stepfunction-role`
  };
};
