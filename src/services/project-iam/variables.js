const fs = require("fs")
const path = require("path")

const policies = () => {
    const baseDirectory = path.join(__dirname, 'policy-templates')
    const fileNames = fs.readdirSync(baseDirectory)

    const allPolicies = fileNames.reduce((obj, fileName) => {
        const filePath = path.join(baseDirectory, fileName)
        const contentsTemplate = fs.readFileSync(filePath, 'utf8')
        const contents = contentsTemplate.split("${prefix}").join("ce-rti")
        obj[path.basename(fileName).replace(path.extname(fileName), '')] = JSON.parse(contents)
        
        return obj
    }, {})

    return allPolicies
  }

module.exports.policies = policies
