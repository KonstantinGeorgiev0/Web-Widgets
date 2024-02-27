# 2023-2024

## Requirements
- [npm](https://www.npmjs.com/) Node v19.9.0 (npm v9.6.7)
- (Optional, but recommended) [yarn](https://yarnpkg.com/)
- (Optional, but recommended) [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm)

## Getting started
Run the command `yarn install` (or `npm install`) to install all required packages.

When working on a widget, run `yarn serve` to start the webpack dev server. This server is reachable at `localhost:8080`
and autoreloads any changes you make in the code.

To simply build the code once you can run `yarn build`. This will create a bundle in the `/dist` folder.

You can select what widget is shown by editing the first line of the file `src/js/index.js` and changing the name
in the `require("...");` line.
