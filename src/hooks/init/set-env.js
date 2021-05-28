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
}
