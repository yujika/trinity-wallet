const Realm = require('realm');

// Don't report Realm JS analytics data
// @see https://github.com/realm/realm-js/blob/master/lib/submit-analytics.js#L28
process.env.REALM_DISABLE_ANALYTICS = 'true';

module.exports = Realm;
