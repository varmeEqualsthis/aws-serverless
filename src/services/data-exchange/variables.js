const fs = require("fs")
const path = require("path")

const transformToPipelineObjects = (objs) => {
    let pipelineObjects = []
    const excludeFields = ["id", "name"]
    objs.forEach((obj) => {
        let pipelineObject = {
            Id: obj.id,
            Name: obj.name,
            Fields: []
        }
        Object.keys(obj).forEach(key => {
            if (!excludeFields.includes(key)) {
                const value = obj[key]
                const isObject = typeof(value) === 'object'
                const field = {
                    "Key": key,
                    [isObject ? "RefValue": "StringValue"]: isObject ? value["ref"] : value
                  }
                pipelineObject.Fields.push(field)    
            }
        })
        pipelineObjects.push(pipelineObject)
    })
    return pipelineObjects
}

const transformToParameterObjects = (objs) => {
    let parameterObjects = []
    const excludeFields = ["id"]
    objs.forEach((obj) => {
        let parameterObject = {
            Id: obj.id,
            Name: obj.name,
            Attributes: []
        }
        Object.keys(obj).forEach(key => {
            if (!excludeFields.includes(key)) {
                const value = obj[key]
                const isObject = typeof(value) === 'object'
                const field = {
                    "Key": key,
                    [isObject ? "RefValue": "StringValue"]: isObject ? value["ref"] : value
                  }
                  parameterObject.Attributes.push(field)    
            }
        })
        parameterObjects.push(parameterObject)
    })
    return parameterObjects
}

const datapipelines = () => {
    
    const baseDirectory = path.join(__dirname, 'datapipeline-definitions')
    const fileNames = fs.readdirSync(baseDirectory)

    const pipelines = fileNames.reduce((obj, fileName) => {
        const filePath = path.join(baseDirectory, fileName)
        const contentsTemplate = fs.readFileSync(filePath, 'utf8')
        const contents = contentsTemplate.split("${prefix}").join("ce-rti")
        const pipelineDefinition = JSON.parse(contents)
        const pipelineObjects = transformToPipelineObjects(pipelineDefinition.objects)
        const parameterObjects = transformToParameterObjects(pipelineDefinition.parameters)
        const parameterValues = []
        const pipeline = {
            parameterObjects,
            parameterValues,
            pipelineObjects
        }
        obj[path.basename(fileName).replace(path.extname(fileName), '')] = pipeline
        return obj
    }, {})

    return pipelines
  }

module.exports.datapipelines = datapipelines
