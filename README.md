# adapt-dev-utils
Task runner utilities for developer tasks and automation

## How to use
When installed through npm, you'll run commands like this:
`adapt-utils sb-clone`

When working directly out of the adapt-dev-utils repository, you'll run commands like this:
`./bin/run sb-clone`

To show available commands:
`adapt-utils` 

To view instructions and options for a given command:
`adapt-utils help sb-clone` 

Example of running a command:
`adapt-utils sb-clone --sourceName="OOD Giving" --targetName="OOD Giving Dev"`

Note that if you omit required options, most commands have an interactive mode which will provide prompts for you to step through instead. This is typically the easiest approach, but in contexts where you need to automate the process you can bypass this by providing arugments for all requried parameters on the command line. 

## Configuration

Configuration variables can be set in a few different ways:

1. Environment variables. 
`GITHUB_TOKEN=YOUR_TOKEN`
1. The config-set command.
`adapt-utils config-set github_token "your_token"`
1. Using an option in the CLI command.
`adapt-utils netlify-cline --githubToken="yourtoken"`


### Github Token
To obtain this token, 
1. Log into your Github account
1. Click on "Settings" in the account menu dropdown (top-right corner of website).
1. Click on "Developer Settings" in the sidebar menu.
1. Select "Personal access tokens", then click "Generate New Token".
1. Select the "repo" scope (this will also select all sub-permissions). 
1. Click "Generate token", and save the token value to your clipboard.

Then set it using one of the following methods:
Environment Variable: GITHUB_TOKEN=your-token
CLI Config: `adapt-utils config-set github_token "your_token"`

### Netlify Token
To obtain this token,
1. Log into Netlify
1. Click "User Settings" from the account menu (top-right corner of the website)
1. Click "Applications"
1. Click "New Access Token"
1. Provide a name, such as "Adapt Dev Utils" and click "Generate Token".

Then set it using one of the following methods:
Environment Variable: NETLIFY_TOKEN=your-token
CLI Config: `adapt-utils config-set netlify_token "your-token"

### Storyblok Token
To obtain this token:
1. Log into Storyblok
1. Find and click the My account menu link (Reveal it by clicking the caret icon next to the Storyblok logo in the top-left of the UI.)
1. Find the "Personal access tokens" section, and click "Generate new token"

Then set it using one of the following methods:
Environment Variable: STORYBLOK_TOKEN=your-token
CLI Config: `adapt-utils config-set storyblok_token "your-token"