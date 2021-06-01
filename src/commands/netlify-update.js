const {Command, flags} = require('@oclif/command');
const NetlifyAPI = require('netlify');
const inquirer = require('inquirer');
const fetch = require('node-fetch');

class NetlifyUpdateCommand extends Command {
  async run() {
    const {flags} = this.parse(NetlifyUpdateCommand)
    const netlify = new NetlifyAPI(flags.token)

    const sites = await netlify.listSites({
      filter: 'all'
    })
    const siteNames = sites.map(site => site.name);

    let responses = await inquirer.prompt([{
      name: 'site',
      message: 'Select a Netlify site to copy:',
      type: 'list',
      choices: siteNames,
    }])

    const selectedSiteName = responses.site;
    const templateSite = sites.find((site) => {return site.name === selectedSiteName});
    console.log('Github User', flags.githubUser)
    console.log('Github token', flags.githubToken)
    // This command will fetch the Repo ID and other metadata for public repos.
    // CURL -u nplowman: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 https://api.github.com/repos/SU-SWS/decanter -H "Accept: application/vnd.github.v3+json"
    const repoMetadata = await fetch(`https://api.github.com/repos/${templateSite.build_settings.repo_path}`, {
      headers: {
        "Accept": "application/json",
        //"Authorization": `Basic ${Buffer.from(flags.githubUser + ':' + flags.githubToken).toString('base64')}`
        "Authorization": `token ${flags.githubToken}`
      }
    })
    .then((response) => response.json())
    
    const repoId = repoMetadata.id

    console.log('repoMetadata', repoMetadata)

    return

    const siteId = '47e53fb7-b111-4f99-942c-d36713e5abcc'
    await netlify.updateSite({
      site_id: siteId,
      body: {
        // Name must be unique across Netlify infrastructure.
        "name": "adapt-cli-a4ff60",
        // We should prompt for the custom domain.
        "custom_domain": "netlify-cli-test.stanford.edu",
        "build_settings": { ...templateSite.build_settings }
        // This one will require a making 2-3 requests before hand.
        // See: https://answers.netlify.com/t/support-guide-linking-a-repository-via-api/121
        
      }
    })
    .catch((err) => {
      this.log(err.json.errors)
    })
  }
}

NetlifyUpdateCommand.description = `Run migrations against Storyblok environment.
This wrapper provides additional protections, such as ensuring migrations are only ran once.

Notes:
- Github username and a personal token is needed for linking repo.
- For instructions on generating the token, see See https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token.
`

NetlifyUpdateCommand.flags = {
  token: flags.string({description: "Netlify token for authentication. Can also be passed in using NETLIFY_TOKEN environment variable.", env: 'NETLIFY_TOKEN', required: true}),
  githubUser: flags.string({description: "Github username (needed to link Netlify site with repo). Can aslo be set permanently using config-set github_user [your_username]", env: 'GITHUB_USER'}),
  githubToken: flags.string({description: "Github personal token (needed to link Netlify site with repo). Can aslo be set permanently using config-set github_token [your_token].", env: 'GITHUB_TOKEN'}),
  debug: flags.boolean({description: "Debug mode with additional output"}),
  dry: flags.boolean({description: 'Dry Run'})
}

module.exports = NetlifyUpdateCommand
