const {Command, flags} = require('@oclif/command')
const fs = require('fs-extra')
const path = require('path')

class ConfigSetCommand extends Command {
  static args = [
    {name: 'key'},
    {name: 'value'}
  ]

  async run() {
    const {args} = this.parse(ConfigSetCommand)
    const configFilePath = path.join(this.config.configDir, 'config.json')

    // Initialize config file if it does not yet exit.
    if (!fs.existsSync(configFilePath)) {
      fs.ensureFileSync(configFilePath)
      fs.writeJSONSync(configFilePath, {
        netlify_token: null,
        storyblok_token: null,
        github_token: null
      })
    }

    const credentials = fs.readJSONSync(configFilePath)
    credentials[args.key] = args.value
    fs.writeJSONSync(configFilePath, credentials)
  }
}

ConfigSetCommand.description = `Set config variables.
Examples:
  adapt-utils config-set storyblok_token yourtoken
  adapt-utils config-set netlify_token yourtoken
`

module.exports = ConfigSetCommand
