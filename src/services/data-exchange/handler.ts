import * as AWS from "aws-sdk"
import * as log from "./lib/log"

export const runDataPipelineHiveScript = async (event, context, callback) => {
  log.info(`begin run data pipeline hive script`, { event })

  try {
    const dataPipeline = new AWS.DataPipeline()

    const pipelines = await dataPipeline.listPipelines().promise()
    const pipeline = pipelines.pipelineIdList.find(
      (pl) => pl.name! === event.dataPipelineName,
    )
    const pipelineId = pipeline.id!
    const params = {
      pipelineId,
      parameterValues: [
        {
          id: "myHiveScript",
          stringValue: event.hiveScript,
        },
        {
          id: "myPipelineLogUri",
          stringValue: event.pipelineLogUri,
        },
      ],
    }

    log.info(`activating data pipeline`, { event, params })
    const activatePipelineResp = await dataPipeline
      .activatePipeline(params)
      .promise()
    log.info(`activated data pipeline`, { event, params })

    callback(null, activatePipelineResp)
  } catch (e) {
    log.error("error running data pipeline hive script", {
      error: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    })
    const errorResponse = {
      body: JSON.stringify(e, Object.getOwnPropertyNames(e)),
      statusCode: 500,
    }
    callback(errorResponse)
  }
}
