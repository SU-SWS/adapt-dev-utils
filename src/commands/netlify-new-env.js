const {Command, flags} = require('@oclif/command');
const NetlifyAPI = require('netlify');
const inquirer = require('inquirer');

class NetlifyNewEnvCommand extends Command {
  async run() {
    const {flags} = this.parse(NetlifyNewEnvCommand)
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
    const selectedSite = sites.find((site) => {return site.name === selectedSiteName});

    responses = await inquirer.prompt([{
      name: 'name',
      message: 'Enter a name for the new Netlify site:',
      type: 'input'
    }])

    const name = responses.name;

    responses = await inquirer.prompt([{
      name: 'repo',
      message: 'Provide the repo url for the new site:',
      type: 'input',
      default: selectedSite.build_settings.repo_url
    }])

    const repo = responses.repo

    responses = await inquirer.prompt([{
      name: 'repo_branch',
      message: 'Enter the branch name to be used for deployments:',
      type: 'input',
      default: selectedSite.build_settings.repo_branch
    }])

    const repo_branch = responses.repo_branch

    this.log(`
  New Site Summary
  ----------------------------------
  Site Name: ${name}
  Template Site: ${selectedSiteName}
  Repo: ${repo}
  Branch: ${repo_branch}
    `);

    responses = await inquirer.prompt([{
      name: 'confirm',
      message: 'Proceed creating site with the above settings?',
      type: 'confirm',
      
    }])
    
    if (!flags.dry) {
      const response = await netlify.createSiteInTeam({
        name: name,
        account_slug: selectedSite.account_slug,
        build_settings: {...selectedSite.build_settings}
      })
    }
  }
}

NetlifyNewEnvCommand.description = `Run migrations against Storyblok environment.
This wrapper provides additional protections, such as ensuring migrations are only ran once.
`

NetlifyNewEnvCommand.flags = {
  token: flags.string({description: "Netlify token for authentication. Can also be passed in using NETLIFY_TOKEN environment variable.", env: 'NETLIFY_TOKEN', required: true}),
  debug: flags.boolean({description: "Debug mode with additional output"}),
  dry: flags.boolean({description: 'Dry Run'})
}

module.exports = NetlifyNewEnvCommand
