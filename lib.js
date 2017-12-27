const request = require("request");


/**
 * Parses the given json string into a JSON object. Internally it uses the
 * JSON.parse() method but adds three things to it:
 * 1. Returns a promise
 * 2. Ensures async result
 * 3. Catches errors and rejects the promise
 * @param {String} json The JSON input string
 * @return {Promise<Object>} Promises an object
 * @todo Investigate if we can drop the try/catch block and rely on the built-in
 *       error catching.
 */
async function parseJSON(json)
{
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            let out;
            try {
                out = JSON.parse(json);
            }
            catch (error) {
                return reject(error);
            }
            resolve(out);
        });
    });
}

/**
 * Promisified version of request. Rejects with an Error or resolves with the
 * response (use response.body to access the parsed body).
 * @param {Object} options The request options
 * @param {Number} delay [0] Delay in milliseconds
 * @return {Promise<Object>}
 */
function requestPromise(options, delay = 0)
{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            request(options, (error, res) => {
                if (error) {
                    return reject(error);
                }
                if (res.statusCode >= 400) {
                    return reject(res.body || res.statusMessage);
                }
                resolve(res);
            });
        }, delay);
    });
}


module.exports = {
    parseJSON,
    requestPromise
};
