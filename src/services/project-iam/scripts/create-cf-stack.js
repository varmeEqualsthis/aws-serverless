const path = require("path");
const fs = require("fs");
const templatePath = path.join(
  __dirname,
  "..",
  ".serverless",
  "cloudformation-template-update-stack.json"
);
let templateContents = fs.readFileSync(templatePath, "utf8");

templateContents = templateContents
  .split("${AWS::AccountId}")
  .join("900319245181");

let obj = JSON.parse(templateContents);
obj.Description = "template for creating roles and policies for ce-rti project";
delete obj["Resources"]["ServerlessDeploymentBucket"];
delete obj["Outputs"]["ServerlessDeploymentBucketName"];
const templateOutput = JSON.stringify(obj, null, 2);

const outputTemplatePath = path.join(
  __dirname,
  "..",
  "output",
  "ce-rti-cloudformation-template-for-iam-roles-and-policies.json"
);
fs.writeFileSync(outputTemplatePath, templateOutput);
//console.log(templateOutput)

//
