const lib    = require("../../lib");
const config = require("../../config");

/**
 * Downloads a file from GitHub
 * @param {Object} file An object having download_url property (as returned by
 *                      the GitHub API)
 * @returns {Promise<string>} A promise resolved with the file contents
 */
function downloadFile(file) {
    console.log(`- Downloading file ${file.download_url}...`);
    return lib.requestPromise({
        uri    : file.download_url,
        headers: {
            "User-Agent": config.gitOrg
        }
    })
    .then(res => res.body);
}

/**
 * Processes all the files one by one.
 * @param {Object[]} files Array of files to process
 * @param {String} server  The FHIR server to upload to
 * @returns {Promise<*>}
 */
function processFiles(files, server) {
    if (!files.length) {
        return Promise.resolve();
    }

    let file = files.shift();
    console.log(`Processing file ${file.path}...`);

    return downloadFile(file)
    .then(contents => {
        console.log(`- Parsing file ${file.name}...`);
        return lib.parseJSON(contents)
    })
    .then(json => uploadFile(server, json))
    .then(
        () => {
            console.log(`- Upload complete`);
            return processFiles(files, server)
        },
        err => {
            console.log(`- Error: ${JSON.stringify(err.issue, null, 4)}`);
            return processFiles(files, server)
        }
    );
}

/**
 * Uploads a JSON file to the server
 * @param {String} server The FHIR server to upload to
 * @param {Object} json   FHIR resource or bundle
 * @returns {Promise<*>}
 */
function uploadFile(server, json) {
    // POST a bundle to the server
    if (json.resourceType == "Bundle" && json.type == "transaction") {
        console.log(`- transaction bundle detected`, `- \tPOSTing a bundle to ${server}`);
        return lib.requestPromise({
            method: "POST",
            uri:  server,
            headers: {
                "User-Agent": config.gitOrg,
                "Accept": "application/json+fhir"
            },
            json: true,
            body  : json
        });
    }

    // Insert or replace by id
    if (json.resourceType && json.id) {
        console.log(`- resource detected`, `- PUT ${server}/${json.resourceType}/${json.id}`);
        return lib.requestPromise({
            method: "PUT",
            uri: `${server}/${json.resourceType}/${json.id}`,
            headers: {
                "User-Agent": config.gitOrg,
                "Accept": "application/json+fhir"
            },
            json: true,
            body: json
        });
    }

    // else create new resource
    if (json.resourceType && json.id) {
        console.log(`- inserting as new resource`, `- POST ${server}/${json.resourceType}`);
        return lib.requestPromise({
            method: "POST",
            uri: `${server}/${json.resourceType}`,
            headers: {
                "User-Agent": config.gitOrg,
                "Accept": "application/json+fhir"
            },
            json: true,
            body: json
        });
    }

    return Promise.reject(new Error("Invalid argument"));
}

/**
 * Gets a list (array) of all the files from the given GitHub uri
 * @param {String} uri The URL of the files
 * @returns {Object[]} Arrays of file objects as returned by the GitHub API
 */
function fetchCustomFiles(uri) {
    return lib.requestPromise({
        uri,
        headers: {
            "User-Agent": config.gitOrg
        },
        json: true
    })
    .then(res => {
        if (!Array.isArray(res.body)) {
            throw new Error("No Files found");
        }
        return res.body;
    });
}


module.exports = function(state) {
    const fhirVersion = config.allowedServers[state.server];
    const gitSrc      = config["gitSrcR" + fhirVersion];
    let filesCount    = 0;

    return fetchCustomFiles(gitSrc)
        .then(files => {
            filesCount = files.length;
            return processFiles(files, state.server);
        })
        .then(() => `${filesCount} files processed successfully!`);
};
