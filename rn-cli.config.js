const blacklist = require("metro").createBlacklist;

module.exports = {
  resolver: {
    blacklistRE: blacklist([
      /#current-cloud-backend\/function\/AvocadoEventWeather\/.*/,
      /#current-cloud-backend\/function\/AvocadoLocationNearbyPlaces\/.*/
    ])
  }
};
