var axios = require("axios");
const { textToADF, isValidADF } = require("./adf-utils");
require("dotenv").config();

const username = process.env.ATLASSIAN_USERNAME;
const password = process.env.ATLASSIAN_API_KEY;
const domain = process.env.DOMAIN;

const auth = {
  username: username,
  password: password,
};

//creates an issue in Jira Cloud using REST API
//description can be either plain text (string) or pre-formatted ADF object
async function createIssue(projectKey, issueType, summary, description) {
  try {
    const baseUrl = "https://" + domain + ".atlassian.net";

    // Handle description: convert plain text to ADF or use existing ADF
    let adfDescription;
    if (typeof description === "string") {
      // Plain text - convert to ADF
      adfDescription = textToADF(description);
    } else if (description && typeof description === "object" && isValidADF(description)) {
      // Already in ADF format - use as is
      adfDescription = description;
    } else if (description && typeof description === "object") {
      // Object but not valid ADF - try to convert to string first
      adfDescription = textToADF(JSON.stringify(description));
    } else {
      // Null, undefined, or other - create empty ADF
      adfDescription = textToADF("");
    }

    const data = {
      fields: {
        project: { key: projectKey },
        summary: summary,
        description: adfDescription,
        issuetype: { name: issueType },
      },
    };
    const config = {
      headers: { "Content-Type": "application/json" },
      auth: auth,
    };
    const response = await axios.post(`${baseUrl}/rest/api/3/issue`, data, config);
    return response.data.key;
  } catch (error) {
    console.log("error: ");
    console.log(error.response.data.errors);
  }
}

module.exports = createIssue;
