const rewireEslint = require('react-app-rewire-eslint');
const rewireMobX = require('react-app-rewire-mobx');

/* config-overrides.js */
module.exports = function override(config, env) {
  // use the MobX rewire
  config = rewireMobX(config,env);

  // custom eslint support
  config = rewireEslint(config, env);
  
  return config;
}