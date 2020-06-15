var ISSUER = process.env.ISSUER || 'https://dev-521711.okta.com/oauth2/default';
var CLIENT_ID = process.env.CLIENT_ID || '0oadgcu962ydolarc4x6';

module.exports = {
  server: {
    oidc: {
      clientId: CLIENT_ID,
      issuer: ISSUER
    },
    assertClaims: {
      aud: 'api://default',
      cid: CLIENT_ID
    }
  }
};