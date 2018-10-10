import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";
import * as AWS from "aws-sdk";
import * as log from "./lib/log";
import * as ajv from "ajv";
import * as jsf from "jsforce";

export const veevaPIR = async (
  event: APIGatewayEvent,
  context: Context,
  cb: Callback
) => {
  log.info(`received pir from veeva inbound api endpoint`, { event });

  try {
    //const kinesis = new AWS.Kinesis();
    // const params = {
    //   StreamName: process.env.ALL_EVENTS_STREAM_NAME,
    //   PartitionKey: "cfa",
    //   Data: event
    // };

    log.info(`validating pir message.`);
    //const jsf = require("jsforce");

    const jsfConn = new jsf.Connection({
      oauth2: {
        loginUrl: "https://test.salesforce.com",
        clientId:
          "3MVG9zZht._ZaMunIw02Zmy.qM8Q3xMYMlER6B_4RchwkAlQKPFzGKwDRCOLFTIr8IS3wfrIKyg3zCYKSkIux",
        clientSecret: "1959802284468702395",
        redirectUri: "https://localhost/oauth/callback"
      }
    });

    const username = "integration1@merck.com.hhusd15";
    const password = "Mrkp@ssw0rd007nNllg3oANNCUePPUrs3FklnSL";

    jsfConn.login(username, password, function(err, userInfo) {
      if (err) {
        return console.error(err);
      }
      // Now you can get the access token and instance URL information.
      // Save them to establish connection next time.
      console.log(jsfConn.accessToken);
      console.log(jsfConn.instanceUrl);
      // logged in user property
      console.log("User ID: " + userInfo.id);
      console.log("Org ID: " + userInfo.organizationId);
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: "connected to salesforce successfully!",
          input: userInfo
        })
      };
      cb(null, response);
    });

    // const isValidPir = await validPIR(event.body);
    // if (!isValidPir) {
    //   log.error("invalid PIR.");
    //   throw "invalid PIR data";
    // }

    //log.info(`publishing pir to all events stream`, { params });

    //const putRecordResp = await kinesis.putRecord(params).promise();

    // log.info(`published pir to all events stream`, { params });
  } catch (e) {
    log.error("error publishing pir to all events stream", { e });
    //   error: JSON.stringify(e, Object.getOwnPropertyNames(e))
    // });

    const errorResponse = {
      body: "error connecting sfdc",
      statusCode: 500
    };
    cb(null, errorResponse);
  }
};

interface PIRequest {
  /*
    Array of PIR
   */
  pir: PIR[];
}

class PIR {
  //pir_status_code
  pir_status_code: string;

  //question
  case_question: string;

  //contact_salutation
  contact_salutation: string;

  //external_req_id
  external_req_id: string;

  //case_department
  case_department: string;

  //contact_firstname
  contact_firstname: string;

  //contact_lastname
  contact_lastname: string;

  //contact_address
  contact_address: string;

  //contact_city
  contact_city: string;

  //case_status
  case_status: string;

  //contact_postal
  contact_postal: string;

  //contact_phone1
  contact_phone1: string;

  //contact_fax
  contact_fax: string;

  //contact_email
  contact_email: string;

  //contact_degree
  contact_degree: string;

  //question_product_code
  question_product_code: string;

  //docid
  docid: string;

  //rep_firstname
  rep_firstname: string;

  //rep_lastname
  rep_lastname: string;

  //external_rep_id
  external_rep_id: string;

  //case_handling
  case_handling: string;

  //case_language
  case_language: string;

  //case_source
  case_source: string;

  //coded_pir_ind
  coded_pir_ind: string;

  //create_letter
  create_letter: string;

  //letter_delivery
  letter_delivery: string;

  //send_email
  send_email: string;
}

const validPIR = async (data: any) => {
  log.info(`validating pir message in validPIR fn`);
  const Ajv = require("ajv");
  let ajv = new Ajv({ allErrors: true });

  //const templatePath = path.join(__dirname, "..", "pirschema.json");
  //let myJsonSchema = fs.readFileSync("./pirschema.json", "utf8");
  const myJsonSchema = require("./pirschema.json");

  log.info(`myJsonSchema:`, myJsonSchema);
  log.info(`PIR data:`, data);
  ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-06.json"));
  const validate = ajv.compile(myJsonSchema);
  const isValid = validate(data);
  log.info(`isValid`, isValid);
  if (!isValid) {
    log.error("Invalid PIR data");
  }
  return isValid;
};

export const allEventsStreamHandler = async (event, context, callback) => {
  log.info(`received pir from all events stream`, { event });

  try {
    const sns = new AWS.SNS();
    const message = {
      default: Buffer.from(event.Records[0].kinesis.data, "base64").toString(
        "utf8"
      )
    };

    const messageString = JSON.stringify(message);
    const params = {
      Message: messageString,
      MessageStructure: "json",
      TargetArn: process.env.VEEVA_INBOUND_TOPIC_ARN
    };

    log.info(`publishing pir to veeva inbound topic`, { params });

    const publishResp = await sns.publish(params).promise();

    log.info(`published pir to veeva inbound topic`, { params });

    callback(null, publishResp);
  } catch (e) {
    log.error("error publishing pir to veeva inbound topic", {
      error: JSON.stringify(e, Object.getOwnPropertyNames(e))
    });
    callback(e);
  }
};

export const snsInboundVeeva = async (event, context, callback) => {
  try {
    const states = new AWS.StepFunctions();
    const params = {
      stateMachineArn: process.env.PROCESS_PIR_FROM_VEEVA_STEP_FN_ARN,
      input: event.Records[0].Sns.Message
    };
    const startExecutionResp = await states.startExecution(params).promise();
    log.info("started step function to process pir", { params });
    callback(null, startExecutionResp);
  } catch (e) {
    log.error("error starting step function to process pir", {
      error: JSON.stringify(e, Object.getOwnPropertyNames(e))
    });
    callback(e);
  }
};

export const tranformPir = async (event, context, callback) => {
  log.info("begin transform pir", { event });
  try {
    let pirs = JSON.parse(event.body);
    console.log("pirs: " + pirs);
    AWS.config.update({ region: "us-east-1" });
    const ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
    pirs.array.forEach(async element => {
      let params = {
        ExpressionAttributeValues: {
          ":s": { S: element.contact_salutation },
          ":t": { S: "SLTTN" }
        },
        KeyConditionExpression: "source_value = :s and type_code = :t",
        ProjectionExpression: "gpir_value",
        TableName: "transform-pir-lookup"
      };
      let result = await ddb.query(params).promise();
      console.log("result is : ", result.Items[0].gpir_value.S);
    });

    event.transformed = true;
    log.info("transformed pir", { event });
    callback(null, event);
  } catch (e) {
    log.error("error transforming pir", {
      error: JSON.stringify(e, Object.getOwnPropertyNames(e))
    });
    callback(e);
  }
};

export function enrichPir(event, context, callback) {
  log.info("begin enrich pir", { event });
  try {
    event.enriched = true;
    log.info("enriched pir", { event });
    callback(null, event);
  } catch (e) {
    log.error("error enriching pir", {
      error: JSON.stringify(e, Object.getOwnPropertyNames(e))
    });
    callback(e);
  }
}

const publishToOutboundIRMSTopic = async event => {
  const sns = new AWS.SNS();
  const message = {
    default: JSON.stringify(event)
  };
  const params = {
    Message: JSON.stringify(message),
    MessageStructure: "json",
    TargetArn: process.env.IRMS_OUTBOUND_TOPIC_ARN
  };
  log.info(`published pir to irms outbound topic`, { params });
  return await sns.publish(params).promise();
};

export const publishPirToIRMS = async (event, context, callback) => {
  try {
    const publishResp = await publishToOutboundIRMSTopic(event);
    callback(null, publishResp);
  } catch (e) {
    log.error("error publishing to outbound IRMS topic", {
      error: JSON.stringify(e, Object.getOwnPropertyNames(e))
    });
    callback(e);
  }
};

export function snsOutboundIrms(event, context, callback) {
  try {
    const message = JSON.parse(event.Records[0].Sns.Message);
    if (message.error) {
      throw new Error("forced error");
    }
    callback(null, message);
  } catch (e) {
    log.error("error posting pir to irms api endpoint", {
      error: JSON.stringify(e, Object.getOwnPropertyNames(e))
    });
    callback(e);
  }
}

export const processIrmsDLQ = async (event, context, callback) => {
  try {
    log.info("checking IRMS DLQ for available messages", { event });
    const queueUrl = process.env.IRMS_DLQ_URL;
    const sqs = new AWS.SQS();
    const receiveMessageResp = await sqs
      .receiveMessage({
        QueueUrl: queueUrl
      })
      .promise();

    if (
      !receiveMessageResp.Messages ||
      receiveMessageResp.Messages.length === 0
    ) {
      log.info("no messages to process");
      return callback(null, "no messges to process");
    }

    log.info(`processing ${receiveMessageResp.Messages.length} messages`, {
      receiveMessageResp
    });

    receiveMessageResp.Messages![0].Body = JSON.parse(
      receiveMessageResp.Messages![0].Body
    );

    const body: any = receiveMessageResp.Messages![0].Body;
    const snsMessage = JSON.parse(body.Message);
    const payload = JSON.parse(snsMessage.Records[0].Sns.Message);

    payload.error = false;

    const publishResp = await publishToOutboundIRMSTopic(payload);
    if (publishResp.MessageId) {
      const deleteMessageResp = await sqs
        .deleteMessage({
          QueueUrl: queueUrl,
          ReceiptHandle: receiveMessageResp.Messages![0].ReceiptHandle!
        })
        .promise();
      log.info("deleted message", { Message: receiveMessageResp.Messages![0] });
      return callback(null, deleteMessageResp);
    }
    callback(null, publishResp);
  } catch (e) {
    log.error("error processing IRMS DLQ", {
      error: JSON.stringify(e, Object.getOwnPropertyNames(e))
    });
    callback(e);
  }
};
