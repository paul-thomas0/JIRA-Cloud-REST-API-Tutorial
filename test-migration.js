// test-migration.js
// Test script to verify JIRA API v3 migration and functionality

require('dotenv').config();
const axios = require('axios');

// Import all service functions
const createIssue = require('./create-issue');
const createProject = require('./create-project');
const getIssues = require('./get-issues');
const getProjects = require('./get-projects');
const getUsers = require('./get-users');
const getIssueByID = require('./get-issue-by-id');
const deleteIssueByID = require('./delete-issue-by-id');
const getTransitions = require('./get-transitions');
const updateStatus = require('./update-status');

// Test configuration
const TEST_CONFIG = {
  projectKey: process.env.PROJECT_KEY || 'TEST',
  issueType: 'Task',
  summary: 'Migration Test Issue',
  description: 'This issue was created to test the API v3 migration',
  projectName: 'Migration Test Project'
};

// Utility functions
const log = (message, data = null) => {
  console.log(`\n🔍 ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

const success = (message) => {
  console.log(`\n✅ ${message}`);
};

const error = (message, err = null) => {
  console.log(`\n❌ ${message}`);
  if (err) {
    console.error(err.message || err);
  }
};

const separator = () => {
  console.log('\n' + '='.repeat(60));
};

// Test functions
async function testEnvironmentSetup() {
  separator();
  log('Testing Environment Setup...');

  const requiredEnvVars = [
    'ATLASSIAN_USERNAME',
    'ATLASSIAN_API_KEY',
    'DOMAIN',
    'LEAD_ACCT_ID',
    'PROJECT_KEY',
    'PROJECT_NAME'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    error('Missing environment variables:', missingVars);
    return false;
  }

  success('All required environment variables are set');
  return true;
}

async function testAPIConnectivity() {
  separator();
  log('Testing API Connectivity...');

  try {
    const baseUrl = `https://${process.env.DOMAIN}.atlassian.net`;
    const response = await axios.get(`${baseUrl}/rest/api/3/serverInfo`, {
      auth: {
        username: process.env.ATLASSIAN_USERNAME,
        password: process.env.ATLASSIAN_API_KEY
      }
    });

    success('Successfully connected to JIRA Cloud');
    log('Server Info:', {
      version: response.data.version,
      versionNumbers: response.data.versionNumbers,
      buildNumber: response.data.buildNumber
    });
    return true;
  } catch (err) {
    error('Failed to connect to JIRA Cloud', err);
    return false;
  }
}

async function testGetProjects() {
  separator();
  log('Testing Get Projects (API v3)...');

  try {
    const projects = await getProjects();
    success('Successfully retrieved projects');
    log('Number of projects found:', projects?.length || 0);
    return true;
  } catch (err) {
    error('Failed to get projects', err);
    return false;
  }
}

async function testGetUsers() {
  separator();
  log('Testing Get Users (API v3)...');

  try {
    const users = await getUsers();
    success('Successfully retrieved users');
    log('Number of users found:', users?.length || 0);
    return true;
  } catch (err) {
    error('Failed to get users', err);
    return false;
  }
}

async function testGetIssues() {
  separator();
  log('Testing Get Issues (API v3)...');

  try {
    const issues = await getIssues();
    success('Successfully retrieved issues');
    log('Issues response:', {
      total: issues?.total || 0,
      maxResults: issues?.maxResults || 0,
      startAt: issues?.startAt || 0,
      issuesCount: issues?.issues?.length || 0
    });
    return true;
  } catch (err) {
    error('Failed to get issues', err);
    return false;
  }
}

async function testCreateIssue() {
  separator();
  log('Testing Create Issue (API v3)...');

  try {
    const issueKey = await createIssue(
      TEST_CONFIG.projectKey,
      TEST_CONFIG.issueType,
      TEST_CONFIG.summary,
      TEST_CONFIG.description
    );

    if (issueKey) {
      success(`Successfully created issue: ${issueKey}`);
      return issueKey;
    } else {
      error('Issue creation returned no key');
      return null;
    }
  } catch (err) {
    error('Failed to create issue', err);
    return null;
  }
}

async function testGetIssueByID(issueKey) {
  if (!issueKey) {
    log('Skipping Get Issue By ID test (no issue key provided)');
    return false;
  }

  separator();
  log(`Testing Get Issue By ID (API v3) - ${issueKey}...`);

  try {
    const issue = await getIssueByID(issueKey);
    success(`Successfully retrieved issue: ${issueKey}`);
    log('Issue details:', {
      key: issue?.key,
      summary: issue?.fields?.summary,
      status: issue?.fields?.status?.name,
      issueType: issue?.fields?.issuetype?.name
    });
    return true;
  } catch (err) {
    error('Failed to get issue by ID', err);
    return false;
  }
}

async function testGetTransitions(issueKey) {
  if (!issueKey) {
    log('Skipping Get Transitions test (no issue key provided)');
    return false;
  }

  separator();
  log(`Testing Get Transitions (API v3) - ${issueKey}...`);

  try {
    const transitions = await getTransitions(issueKey);
    success(`Successfully retrieved transitions for: ${issueKey}`);
    log('Available transitions:', transitions?.transitions?.map(t => ({
      id: t.id,
      name: t.name,
      to: t.to?.name
    })));
    return transitions?.transitions?.[0]?.id || null;
  } catch (err) {
    error('Failed to get transitions', err);
    return false;
  }
}

async function testUpdateStatus(issueKey, transitionId) {
  if (!issueKey || !transitionId) {
    log('Skipping Update Status test (missing issue key or transition ID)');
    return false;
  }

  separator();
  log(`Testing Update Status (API v3) - ${issueKey} -> ${transitionId}...`);

  try {
    const status = await updateStatus(issueKey, transitionId);
    if (status === 204 || status === 200) {
      success(`Successfully updated issue status: ${issueKey}`);
      return true;
    } else {
      error(`Unexpected status code: ${status}`);
      return false;
    }
  } catch (err) {
    error('Failed to update status', err);
    return false;
  }
}

async function testDeleteIssue(issueKey) {
  if (!issueKey) {
    log('Skipping Delete Issue test (no issue key provided)');
    return false;
  }

  separator();
  log(`Testing Delete Issue (API v3) - ${issueKey}...`);

  try {
    await deleteIssueByID(issueKey);
    success(`Successfully deleted issue: ${issueKey}`);
    return true;
  } catch (err) {
    error('Failed to delete issue', err);
    return false;
  }
}

// Main test runner
async function runMigrationTests() {
  console.log('🚀 JIRA Cloud REST API v3 Migration Test Suite');
  console.log('='.repeat(60));

  let testsPassed = 0;
  let testsTotal = 0;
  let createdIssueKey = null;
  let transitionId = null;

  // Environment setup test
  testsTotal++;
  if (await testEnvironmentSetup()) {
    testsPassed++;
  } else {
    console.log('\n❌ Cannot proceed without proper environment setup');
    return;
  }

  // API connectivity test
  testsTotal++;
  if (await testAPIConnectivity()) {
    testsPassed++;
  } else {
    console.log('\n❌ Cannot proceed without API connectivity');
    return;
  }

  // Basic read operations
  testsTotal++;
  if (await testGetProjects()) testsPassed++;

  testsTotal++;
  if (await testGetUsers()) testsPassed++;

  testsTotal++;
  if (await testGetIssues()) testsPassed++;

  // Issue creation and manipulation
  testsTotal++;
  createdIssueKey = await testCreateIssue();
  if (createdIssueKey) testsPassed++;

  testsTotal++;
  if (await testGetIssueByID(createdIssueKey)) testsPassed++;

  testsTotal++;
  transitionId = await testGetTransitions(createdIssueKey);
  if (transitionId) testsPassed++;

  if (transitionId) {
    testsTotal++;
    if (await testUpdateStatus(createdIssueKey, transitionId)) testsPassed++;
  }

  // Cleanup
  if (createdIssueKey) {
    testsTotal++;
    if (await testDeleteIssue(createdIssueKey)) testsPassed++;
  }

  // Final results
  separator();
  console.log('\n📊 TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Tests Passed: ${testsPassed}/${testsTotal}`);
  console.log(`Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);

  if (testsPassed === testsTotal) {
    console.log('\n🎉 ALL TESTS PASSED! API v3 migration is successful!');
  } else {
    console.log(`\n⚠️  ${testsTotal - testsPassed} test(s) failed. Please check the errors above.`);
  }

  separator();
  console.log('\n✨ Migration test complete!');
  console.log('🚀 Start your server with: node app.js');
  console.log('📚 View API docs at: http://localhost:3000/api-docs');
}

// Run tests if called directly
if (require.main === module) {
  runMigrationTests().catch(console.error);
}

module.exports = {
  runMigrationTests,
  testEnvironmentSetup,
  testAPIConnectivity,
  testGetProjects,
  testGetUsers,
  testGetIssues,
  testCreateIssue,
  testGetIssueByID,
  testGetTransitions,
  testUpdateStatus,
  testDeleteIssue
};
