const fs = require('fs-extra')
const path = require('path')

module.exports = async function(options) {
  const configFilePath = path.join(options.config.configDir, 'config.json')
  const configs = fs.readJsonSync(configFilePath);

  if (configs.storyblok_token) {
    process.env.STORYBLOK_TOKEN = configs.storyblok_token
  }

  if (configs.netlify_token) {
    process.env.NETLIFY_TOKEN = configs.netlify_token
  }

  if (configs.github_user) {
    process.env.GITHUB_USER = configs.github_user
  }

  if (configs.github_token) {
    process.env.GITHUB_TOKEN = configs.github_token
  }
}
