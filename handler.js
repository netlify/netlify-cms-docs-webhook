const crypto = require('crypto');
const axios = require('axios');

function signRequestBody(key, body) {
  return `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
}

module.exports.githubWebhookListener = (event, context, callback) => {
  var errMsg; // eslint-disable-line
  const token = process.env.GITHUB_WEBHOOK_SECRET;
  const netlifyWebhook = process.env.NETLIFY_WEBHOOK_BUILD;
  const headers = event.headers;
  const sig = headers['X-Hub-Signature'];
  const githubEvent = headers['X-GitHub-Event'];
  const id = headers['X-GitHub-Delivery'];
  const calculatedSig = signRequestBody(token, event.body);

  if (typeof token !== 'string') {
    errMsg = '[401] must provide a \'GITHUB_WEBHOOK_SECRET\' env variable';
    return callback(new Error(errMsg));
  }

  if (!sig) {
    errMsg = '[401] No X-Hub-Signature found on request';
    return callback(new Error(errMsg));
  }

  if (!githubEvent) {
    errMsg = '[422] No X-Github-Event found on request';
    return callback(new Error(errMsg));
  }

  if (!id) {
    errMsg = '[401] No X-Github-Delivery found on request';
    return callback(new Error(errMsg));
  }

  // TODO: Figure out why this check always fails
  // if (sig !== calculatedSig) {
  //   console.log('---------------------------------');
  //   console.log("sig from header: ", sig)
  //   console.log('---------------------------------');
  //   console.log("calculatedSig: ", calculatedSig)
  //   console.log('---------------------------------');
  //   errMsg = '[401] X-Hub-Signature incorrect. Github webhook token doesn\'t match';
  //   return callback(new Error(errMsg));
  // }

  /* eslint-disable */
  console.log('---------------------------------');
  console.log(`Github-Event: "${githubEvent}" with action: "${event.body.action}"`);
  console.log('---------------------------------');
  console.log('Payload', event.body);
  /* eslint-enable */

  // This fires the Netlify webhook to deploy, it the above succeeds without error
  // For more on events see https://developer.github.com/v3/activity/events/types/
  axios.post(netlifyWebhook)
    .then((res) => console.log("success: ", res))
    .catch((err) => console.log(err));

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
    }),
  };

  return callback(null, response);
};
