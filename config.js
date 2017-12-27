const GIT_ORG = process.env.GIT_ORG || "smart-on-fhir";

module.exports = {

    port: process.env.PORT || 9444,

    secret: process.env.SECRET || "change-me",

    gitOrg: GIT_ORG,

    // The github location ot the custom data for DSTU2
    gitSrcR2: `https://api.github.com/repos/${GIT_ORG}/generated-sample-data/contents/DSTU-2/CUSTOM`,

    // The github location ot the custom data for STU3
    gitSrcR3: `https://api.github.com/repos/${GIT_ORG}/generated-sample-data/contents/STU-3/CUSTOM`,

    // The format is "url (no trailing slash): fhir version integer"
    allowedServers: {
        "https://sb-fhir-stu3.smarthealthit.org/smartstu3/open"  : 3,
        "https://sb-fhir-dstu2.smarthealthit.org/smartdstu2/open": 2
    }
};
