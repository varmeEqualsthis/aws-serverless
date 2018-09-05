'use strict';

const co             = require('co');
const Promise        = require('bluebird');
const AWS            = require('aws-sdk');
const cloudWatchLogs = Promise.promisifyAll(new AWS.CloudWatchLogs());
const destArn        = process.env.DEST_FUNC;
const destFuncName   = destArn.split(":").reverse()[0];

let subscribe = function* (logGroupName) {
  let options = {
    destinationArn : destArn,
    logGroupName   : logGroupName,
    filterName     : `${process.env.SERVICE_PREFIX}-ship-logs`,
    filterPattern  : `[timestamp=*Z, request_id="*-*", event]`
  };

  yield cloudWatchLogs.putSubscriptionFilterAsync(options);
};

module.exports.handler = co.wrap(function* (event, context, callback) {
  console.log(JSON.stringify(event));
  
  // eg. /aws/lambda/logging-demo-dev-api
  let logGroupName = event.detail.requestParameters.logGroupName;
  console.log(`log group: ${logGroupName}`);

  if (logGroupName === `/aws/lambda/${destFuncName}`) {
    console.log("ignoring the log group for the ship-logs function to avoid invocation loop!");
    callback(null, 'ignored');
  } else if (logGroupName.replace("/aws/lambda/", "").startsWith(process.env.FUNCTION_NAME_MATCH_PREFIX)) {
    yield subscribe(logGroupName);
    console.log(`subscribed [${logGroupName}] to [${destArn}]`);
    callback(null, 'ok');
  } else {
    console.log(`ignoring the log group ${logGroupName} since it doesn't match ${process.env.FUNCTION_NAME_MATCH_PREFIX}`);
    callback(null, 'ignored');
  }
});