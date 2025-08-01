/**
 * ADF Examples and Testing Script
 *
 * This file demonstrates how to use Atlassian Document Format (ADF) with JIRA Cloud REST API v3.
 * It includes examples of different ADF structures and a test function to verify they work.
 */

require('dotenv').config();
const {
  textToADF,
  createFormattedADF,
  createBulletListADF,
  createOrderedListADF,
  createHeadingWithContentADF,
  createCodeBlockADF,
  createLinkADF,
  combineADFContent,
  isValidADF
} = require('./adf-utils');
const createIssue = require('./create-issue');

// Example 1: Simple text description
const simpleTextExample = () => {
  const plainText = "This is a simple description with multiple lines.\n\nThis is the second paragraph.";
  const adf = textToADF(plainText);
  console.log('\n=== Simple Text Example ===');
  console.log('Plain text:', plainText);
  console.log('ADF format:', JSON.stringify(adf, null, 2));
  return adf;
};

// Example 2: Formatted text with bold and italic
const formattedTextExample = () => {
  const formattedNodes = [
    { text: "This issue requires " },
    { text: "immediate attention", marks: [{ type: "strong" }] },
    { text: " and should be handled with " },
    { text: "care", marks: [{ type: "em" }] },
    { text: "." }
  ];
  const adf = createFormattedADF(formattedNodes);
  console.log('\n=== Formatted Text Example ===');
  console.log('Formatted ADF:', JSON.stringify(adf, null, 2));
  return adf;
};

// Example 3: Bullet list description
const bulletListExample = () => {
  const items = [
    "Review the current implementation",
    "Identify potential security vulnerabilities",
    "Create test cases for edge scenarios",
    "Update documentation"
  ];
  const adf = createBulletListADF(items);
  console.log('\n=== Bullet List Example ===');
  console.log('Bullet list ADF:', JSON.stringify(adf, null, 2));
  return adf;
};

// Example 4: Numbered list description
const numberedListExample = () => {
  const steps = [
    "Clone the repository",
    "Install dependencies using npm install",
    "Configure environment variables",
    "Run the application with npm start"
  ];
  const adf = createOrderedListADF(steps);
  console.log('\n=== Numbered List Example ===');
  console.log('Numbered list ADF:', JSON.stringify(adf, null, 2));
  return adf;
};

// Example 5: Heading with content
const headingExample = () => {
  const adf = createHeadingWithContentADF(
    "Bug Report",
    2,
    "The following issue has been identified in the login functionality:"
  );
  console.log('\n=== Heading Example ===');
  console.log('Heading ADF:', JSON.stringify(adf, null, 2));
  return adf;
};

// Example 6: Code block description
const codeBlockExample = () => {
  const code = `function authenticate(username, password) {
  if (!username || !password) {
    throw new Error('Missing credentials');
  }
  return jwt.sign({ username }, secret);
}`;
  const adf = createCodeBlockADF(code, 'javascript');
  console.log('\n=== Code Block Example ===');
  console.log('Code block ADF:', JSON.stringify(adf, null, 2));
  return adf;
};

// Example 7: Link description
const linkExample = () => {
  const adf = createLinkADF(
    "Please refer to our documentation",
    "https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/"
  );
  console.log('\n=== Link Example ===');
  console.log('Link ADF:', JSON.stringify(adf, null, 2));
  return adf;
};

// Example 8: Complex combined description
const complexExample = () => {
  const heading = {
    type: "heading",
    attrs: { level: 2 },
    content: [{ type: "text", text: "Issue Description" }]
  };

  const paragraph1 = {
    type: "paragraph",
    content: [
      { type: "text", text: "This is a " },
      { type: "text", text: "critical", marks: [{ type: "strong" }] },
      { type: "text", text: " issue that needs immediate attention." }
    ]
  };

  const bulletList = {
    type: "bulletList",
    content: [
      {
        type: "listItem",
        content: [{
          type: "paragraph",
          content: [{ type: "text", text: "Affects user authentication" }]
        }]
      },
      {
        type: "listItem",
        content: [{
          type: "paragraph",
          content: [{ type: "text", text: "Blocks new user registration" }]
        }]
      }
    ]
  };

  const codeBlock = {
    type: "codeBlock",
    attrs: { language: "javascript" },
    content: [{ type: "text", text: "console.log('Debug info');" }]
  };

  const adf = combineADFContent([heading, paragraph1, bulletList, codeBlock]);
  console.log('\n=== Complex Combined Example ===');
  console.log('Complex ADF:', JSON.stringify(adf, null, 2));
  return adf;
};

// Test function to validate ADF structures
const validateADFExamples = () => {
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATING ADF EXAMPLES');
  console.log('='.repeat(60));

  const examples = [
    { name: 'Simple Text', adf: simpleTextExample() },
    { name: 'Formatted Text', adf: formattedTextExample() },
    { name: 'Bullet List', adf: bulletListExample() },
    { name: 'Numbered List', adf: numberedListExample() },
    { name: 'Heading', adf: headingExample() },
    { name: 'Code Block', adf: codeBlockExample() },
    { name: 'Link', adf: linkExample() },
    { name: 'Complex Combined', adf: complexExample() }
  ];

  examples.forEach(example => {
    const isValid = isValidADF(example.adf);
    console.log(`\n${example.name}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    if (!isValid) {
      console.log('Structure:', JSON.stringify(example.adf, null, 2));
    }
  });
};

// Test function to create actual JIRA issues with different ADF formats
const testADFWithJIRA = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING ADF WITH JIRA ISSUES');
  console.log('='.repeat(60));

  const projectKey = process.env.PROJECT_KEY || 'TEST';
  const testCases = [
    {
      name: 'Simple Text Issue',
      summary: 'ADF Test - Simple Text',
      description: 'This is a simple description.\n\nWith multiple paragraphs.'
    },
    {
      name: 'Bullet List Issue',
      summary: 'ADF Test - Bullet List',
      description: null, // Will use createBulletListADF
      customADF: createBulletListADF([
        'First requirement',
        'Second requirement',
        'Third requirement'
      ])
    },
    {
      name: 'Code Block Issue',
      summary: 'ADF Test - Code Block',
      description: null, // Will use createCodeBlockADF
      customADF: createCodeBlockADF('console.log("Hello ADF!");', 'javascript')
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n🧪 Testing: ${testCase.name}`);

      let issueKey;
      if (testCase.customADF) {
        // For custom ADF, we need to modify createIssue to accept ADF directly
        console.log('Custom ADF structure:', JSON.stringify(testCase.customADF, null, 2));
        // Note: This would require modifying createIssue to accept pre-formatted ADF
        console.log('⚠️  Custom ADF test skipped - would need modified createIssue function');
      } else {
        issueKey = await createIssue(projectKey, 'Task', testCase.summary, testCase.description);
        console.log(`✅ Created issue: ${issueKey}`);
      }
    } catch (error) {
      console.log(`❌ Failed to create ${testCase.name}:`, error.message);
    }
  }
};

// Main execution function
const runADFExamples = async () => {
  console.log('ATLASSIAN DOCUMENT FORMAT (ADF) EXAMPLES');
  console.log('==========================================');

  // Validate all ADF examples
  validateADFExamples();

  // Test with actual JIRA API (if environment is configured)
  if (process.env.ATLASSIAN_USERNAME && process.env.ATLASSIAN_API_KEY && process.env.DOMAIN) {
    console.log('\n🔄 Environment configured - testing with actual JIRA API...');
    await testADFWithJIRA();
  } else {
    console.log('\n⚠️  JIRA environment not configured - skipping live API tests');
    console.log('To test with JIRA, configure: ATLASSIAN_USERNAME, ATLASSIAN_API_KEY, DOMAIN, PROJECT_KEY');
  }

  console.log('\n' + '='.repeat(60));
  console.log('ADF EXAMPLES COMPLETE');
  console.log('='.repeat(60));
};

// Export for use in other files
module.exports = {
  simpleTextExample,
  formattedTextExample,
  bulletListExample,
  numberedListExample,
  headingExample,
  codeBlockExample,
  linkExample,
  complexExample,
  validateADFExamples,
  testADFWithJIRA,
  runADFExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runADFExamples().catch(console.error);
}
