const {Command, flags} = require('@oclif/command')
const StoryblokClient = require('storyblok-js-client')
const {cli} = require('cli-ux')
const inquirer = require('inquirer')

class CloneCommand extends Command {
  async run() {
    const {flags} = this.parse(CloneCommand)
    const Storyblok = new StoryblokClient({
      oauthToken: flags.token
    })

    const spaces = await Storyblok.get('spaces/', {})
    .then(response => {
      return response.data.spaces.map(space => {
        return {
          name: space.name,
          value: space.id
        }
      })
    })
    .catch((err) => {
      if (flags.debug) this.log(err)
      this.error(`Unable to retrieve list of Storyblok spaces. Make sure your token is configured correctly.`)
    })

    let sourceId

    // Provide select list of spaces to clone from.
    if (!flags.sourceId) {
      let responses = await inquirer.prompt([{
        name: 'sourceId',
        message: 'Select a space to copy from:',
        type: 'list',
        choices: spaces,
      }])
      sourceId = responses.sourceId
    }
    // If a Space ID was passed in on the argument list, make sure it is valid.
    else {
      for (const space of spaces) {
        if (flags.sourceId == space.value) {
          sourceId = flags.sourceId
        }
      }
      if (!sourceId) this.error('sourceId is invalid')
    }
    
    let targetName = flags.targetName
    if (!flags.targetName) {
      let responses = await inquirer.prompt([{
        name: 'targetName',
        message: 'Enter a name for the new space',
        type: 'input'
      }])
      targetName = responses.targetName
    }
    
    cli.action.start('Duplicating Storyblok space')
    Storyblok.post('spaces/', {
      "dup_id": sourceId,
      "space": {
        "name": targetName
      }
    }).then((response) => {
      if (flags.debug) this.log(response)
      cli.action.stop()
      this.log('New space created successfully:')
      this.log(`Space ID: ${response.data.space.id}`)
      this.log(`Space Name: ${response.data.space.name}`)
    })
    .catch((err) => {
      if (flags.debug) this.log(err)
      this.err(`Failed to clone space. Make sure your token is correct and that the sourceId or sourceName is valid.`)
    })
  }
}

CloneCommand.description = `Clone content and structure from an existing Storyblok space to a new space.
Examples:
  adapt-utils sb-clone --sourceName="OOD Giving" --targetName="OOD Giving Dev" --token=[your_token]
  adapt-utils sb-clone --sourceId=78141 --targetName="OOD Giving Dev" --token=[your_token]

Notes:
  - Make sure the token provided has permission to Read and Create Spaces.
  - Token can be set permanently using "adapt-utils set-config storyblok_token [yourtoken]" or the STORYBLOK_TOKEN environment variable.
`

CloneCommand.flags = {
  sourceId: flags.string({description: 'ID of space to clone from.', exclusive: ['sourceName']}),
  targetName: flags.string({description: 'Name of new space to clone to'}),
  token: flags.string({description: "Storyblok token for authentication. Tokens can be generated in the My Account section of Storyblok.", env: 'STORYBLOK_TOKEN', required: true}),
  debug: flags.boolean({description: "Debug mode with additional output"})
}

module.exports = CloneCommand
