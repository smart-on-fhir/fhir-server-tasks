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

        // Current STU3 servers
        "https://sb-fhir-stu3.smarthealthit.org/smartstu3/open": 3,
        "https://sb-fhir-stu3.smarthealthit.org/smartstu3/data": 3,

        // Current DSTU2 servers
        "https://sb-fhir-dstu2.smarthealthit.org/smartdstu2/open": 2,
        "https://sb-fhir-dstu2.smarthealthit.org/smartdstu2/data": 2,

        // Test STU3 servers
        "https://sbt-fhir-stu3.smarthealthit.org/smartstu3/open": 3,
        "https://sbt-fhir-stu3.smarthealthit.org/smartstu3/data": 3,

        // Test DSTU2 servers
        "https://sbt-fhir-dstu2.smarthealthit.org/smartdstu2/open": 2,
        "https://sbt-fhir-dstu2.smarthealthit.org/smartdstu2/data": 2
        
    }
};
