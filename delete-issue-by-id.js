var axios = require("axios");
require("dotenv").config();

const username = process.env.ATLASSIAN_USERNAME;
const password = process.env.ATLASSIAN_API_KEY;
const domain = process.env.DOMAIN;

const auth = {
  username: username,
  password: password,
};

//Deletes an issue by ID using the Jira Cloud REST API
async function deleteIssueByID(issueKey) {
  try {
    const baseUrl = "https://" + domain + ".atlassian.net";

    const config = {
      method: "delete",
      url: baseUrl + "/rest/api/3/issue/" + issueKey,
      headers: { "Content-Type": "application/json" },
      auth: auth,
    };
    const response = await axios.request(config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log("error: ");
    console.log(error.response.data.errors);
  }
}

module.exports = deleteIssueByID;
