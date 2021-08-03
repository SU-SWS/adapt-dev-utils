/* eslint-disable camelcase */
const {Command, flags} = require('@oclif/command')
const NetlifyAPI = require('netlify')
const inquirer = require('inquirer')
const fetch = require('node-fetch')

class NetlifyNewEnvCommand extends Command {
  async run() {
    const {flags} = this.parse(NetlifyNewEnvCommand)
    const netlify = new NetlifyAPI(flags.netlifyToken)

    const sites = await netlify.listSites({
      filter: 'all',
    })
    const siteNames = sites.map(site => site.name)

    let responses = await inquirer.prompt([{
      name: 'site',
      message: 'Select a Netlify site to copy:',
      type: 'list',
      choices: siteNames,
    }])

    const selectedSiteName = responses.site
    const selectedSite = sites.find(site => {
      return site.name === selectedSiteName
    })

    responses = await inquirer.prompt([{
      name: 'name',
      message: 'Enter a name for the new Netlify site:',
      type: 'input',
    }])

    const name = responses.name

    responses = await inquirer.prompt([{
      name: 'repo',
      message: 'Provide the repo url for the new site:',
      type: 'input',
      default: selectedSite.build_settings.repo_url,
    }])

    const repo_url = responses.repo
    const repo_url_parts = repo_url.match(/https?:\/\/([^\/]+)\/(.*)/)
    const repo_path = repo_url_parts[2]

    // Add the deploy key to the repo.
    const deploy_key = await fetch('https://api.netlify.com/api/v1/deploy_keys', {
      method: 'post',
      headers: {
        Authorization: `Bearer ${flags.netlifyToken}`,
      },
    })
    .then(response => response.json())
    .then(json => json)

    await fetch(`https://api.github.com/repos/${repo_path}/keys`, {
      method: 'post',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${flags.githubToken}`,
      },
      body: JSON.stringify({
        title: `Netlify: ${name}`,
        key: deploy_key.public_key,
      }),
    })
    .then(res => {
      if (res.status === 201) {
        console.log('Deploy key added to Github repo')
      } else {
        throw new Error('Failed to add deploy key to github')
      }
    })
    .catch(err => {
      console.log('Failed to add deploy key to Github repo')
      console.log(err)
    })

    const repoMetadata = await fetch(`https://api.github.com/repos/${repo_path}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${flags.githubToken}`,
      },
    })
    .then(response => response.json())

    responses = await inquirer.prompt([{
      name: 'repo_branch',
      message: 'Enter the branch name to be used for deployments:',
      type: 'input',
      default: selectedSite.build_settings.repo_branch,
    }])

    const repo_branch = responses.repo_branch

    this.log(`
  New Site Summary
  ----------------------------------
  Site Name: ${name}
  Template Site: ${selectedSiteName}
  Repo: ${repo_url}
  Branch: ${repo_branch}
    `)

    responses = await inquirer.prompt([{
      name: 'confirm',
      message: 'Proceed creating site with the above settings?',
      type: 'confirm',
    }])

    if (!flags.dry) {
      await netlify.createSiteInTeam({
        account_slug: selectedSite.account_slug,
        body: {
          name: name,
          repo: {
            provider: 'github',
            id: repoMetadata.id,
            repo: repo_path,
            private: !selectedSite.build_settings.public_repo,
            branch: repo_branch,
            cmd: selectedSite.build_settings.cmd,
            dir: selectedSite.build_settings.dir,
            deploy_key_id: deploy_key.id,
            env: selectedSite.build_settings.env,
          },
        },
      })
      .then(response => {
        console.log('Successfully created new site!')
      })
      .catch(err => {
        console.log(err)
      })
    }
  }
}

NetlifyNewEnvCommand.description = `Create a new Netlify site, cloned from an existing site.
`

NetlifyNewEnvCommand.flags = {
  netlifyToken: flags.string({description: 'Netlify token for authentication. Can also be passed in using NETLIFY_TOKEN environment variable.', env: 'NETLIFY_TOKEN', required: true}),
  githubToken: flags.string({description: 'Github personal token (needed to link Netlify site with repo). Can aslo be set permanently using config-set github_token [your_token].', env: 'GITHUB_TOKEN'}),
  debug: flags.boolean({description: 'Debug mode with additional output'}),
  dry: flags.boolean({description: 'Dry Run'}),
}

module.exports = NetlifyNewEnvCommand
