const {Command, flags} = require('@oclif/command')
const StoryblokClient = require('storyblok-js-client');

class CloneCommand extends Command {
  async run() {
    const {flags} = this.parse(CloneCommand)
    const Storyblok = new StoryblokClient({
      oauthToken: flags.token
    })

    let spaceId;

    // Make sure the spaceId is valid, if using --sourceId.
    if (flags.sourceId) {
      if (flags.debug) this.log('Confirming sourceId is valid')
      await Storyblok.get(`spaces/${flags.sourceId}`, {})
      .then((response) => {
        if (flags.debug) this.log(response)
        spaceId = response.data.space.id
      })
      .catch((err) => {
        if (flags.debug) this.log(err)
        this.error(`Unable to find Storyblok space with id "${flags.sourceId}"`)
      })
    }

    // Look up spaceId by name, if using --sourceName.
    if (flags.sourceName) {
      if (flags.debug) this.log('Looking up Space ID from sourceName')
      spaceId = await Storyblok.get('spaces/', {})
      .then(response => {
        if (flags.debug) this.log(response)
        for (const space of response.data.spaces) {
          if (space.name == flags.sourceName) {
            return space.id
          }
        }
        if (!spaceId) this.error(`Unable to find Storyblok space named "${flags.sourceName}"`)
      })
      .catch((err) => {
        if (flags.debug) this.log(err)
        this.error(`Failed to look up Storyblok space by name. Verify the name is correct and that your token is valid.`)
      })
    }

    if (flags.debug) this.log('Duplicating Storyblok space.')
    Storyblok.post('spaces/', {
      "dup_id": spaceId,
      "space": {
        "name": flags.targetName
      }
    }).then((response) => {
      if (flags.debug) this.log(response)
      this.log("New space created successfully.")
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
  - Token can also be passed in using environment variable named STORYBLOK_TOKEN.
`

CloneCommand.flags = {
  sourceName: flags.string({description: 'Name of space to clone from.', exclusive: ['sourceId']}),
  sourceId: flags.string({description: 'ID of space to clone from.', exclusive: ['sourceName']}),
  targetName: flags.string({description: 'Name of new space to clone to', required: true}),
  token: flags.string({description: "Storyblok token for authentication. Tokens can be generated in the My Account section of Storyblok. Can also be passed in using STORYBLOK_TOKEN environment variable.", env: 'STORYBLOK_TOKEN', required: true}),
  debug: flags.boolean({description: "Debug mode with additional output"})
}

module.exports = CloneCommand
