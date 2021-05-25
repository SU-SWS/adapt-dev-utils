const {Command, flags} = require('@oclif/command');
const StoryblokClient = require('storyblok-js-client');

class MigrateCommand extends Command {
  async run() {
    const {flags} = this.parse(MigrateCommand)
    const Storyblok = new StoryblokClient({
      oauthToken: flags.token
    })
    Storyblok.get('spaces/78141/datasource_entries', {
      datasource_slug: 'site-metadata'
    })
    .then(response => {
      console.log(response.data)
    })
    
  }
}

MigrateCommand.description = `Run migrations against Storyblok environment.
This wrapper provides additional protections, such as ensuring migrations are only ran once.
`

MigrateCommand.flags = {
  token: flags.string({description: "Storyblok token for authentication. Tokens can be generated in the My Account section of Storyblok. Can also be passed in using STORYBLOK_TOKEN environment variable.", env: 'STORYBLOK_TOKEN', required: true}),
  debug: flags.boolean({description: "Debug mode with additional output"}),
  spaceId: flags.string({description: "Numeric ID for the Storyblok Space"}),
  
}

module.exports = MigrateCommand
