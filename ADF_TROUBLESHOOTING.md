# Atlassian Document Format (ADF) Troubleshooting Guide

## Error: "Operation value must be an Atlassian Document (see the Atlassian Document Format)"

### What is this error?

This error occurs when you try to send data to the JIRA Cloud REST API v3 that doesn't conform to the Atlassian Document Format (ADF). Starting with API v3, certain fields like `description` must be formatted as ADF objects instead of plain text strings.

### Quick Fix

**Before (causes error):**
```javascript
const data = {
  fields: {
    project: { key: "PROJ" },
    summary: "My issue summary",
    description: "This is a plain text description", // ❌ This causes the error
    issuetype: { name: "Task" },
  },
};
```

**After (works correctly):**
```javascript
const data = {
  fields: {
    project: { key: "PROJ" },
    summary: "My issue summary",
    description: {                                    // ✅ ADF format
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "This is a plain text description"
            }
          ]
        }
      ]
    },
    issuetype: { name: "Task" },
  },
};
```

## Automatic Solution

This project includes utility functions to automatically convert plain text to ADF format:

```javascript
const { textToADF } = require('./adf-utils');

// Convert plain text to ADF
const description = "My plain text description";
const adfDescription = textToADF(description);

// Now use adfDescription in your API call
```

## Common ADF Patterns

### 1. Simple Text
```javascript
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Your text here"
        }
      ]
    }
  ]
}
```

### 2. Multiple Paragraphs
```javascript
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "First paragraph"
        }
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Second paragraph"
        }
      ]
    }
  ]
}
```

### 3. Formatted Text (Bold, Italic)
```javascript
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "This is "
        },
        {
          "type": "text",
          "text": "bold text",
          "marks": [
            {
              "type": "strong"
            }
          ]
        },
        {
          "type": "text",
          "text": " and this is "
        },
        {
          "type": "text",
          "text": "italic text",
          "marks": [
            {
              "type": "em"
            }
          ]
        }
      ]
    }
  ]
}
```

### 4. Bullet List
```javascript
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "First item"
                }
              ]
            }
          ]
        },
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "Second item"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 5. Code Block
```javascript
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "codeBlock",
      "attrs": {
        "language": "javascript"
      },
      "content": [
        {
          "type": "text",
          "text": "console.log('Hello World!');"
        }
      ]
    }
  ]
}
```

## Using the ADF Utilities

This project includes comprehensive ADF utilities in `adf-utils.js`:

### Basic Text Conversion
```javascript
const { textToADF } = require('./adf-utils');

const plainText = "This is my description\n\nWith multiple paragraphs";
const adf = textToADF(plainText);
```

### Formatted Text
```javascript
const { createFormattedADF } = require('./adf-utils');

const formattedText = createFormattedADF([
  { text: "This is " },
  { text: "important", marks: [{ type: "strong" }] },
  { text: " information." }
]);
```

### Lists
```javascript
const { createBulletListADF, createOrderedListADF } = require('./adf-utils');

// Bullet list
const bulletList = createBulletListADF([
  "First requirement",
  "Second requirement",
  "Third requirement"
]);

// Numbered list
const numberedList = createOrderedListADF([
  "Step one",
  "Step two",
  "Step three"
]);
```

### Code Blocks
```javascript
const { createCodeBlockADF } = require('./adf-utils');

const codeBlock = createCodeBlockADF(
  'function hello() {\n  console.log("Hello!");\n}',
  'javascript'
);
```

## Testing Your ADF

Use the validation function to check if your ADF is valid:

```javascript
const { isValidADF } = require('./adf-utils');

const myADF = textToADF("Test description");
if (isValidADF(myADF)) {
  console.log("✅ Valid ADF structure");
} else {
  console.log("❌ Invalid ADF structure");
}
```

## Running Examples

Test different ADF formats with the examples file:

```bash
node adf-examples.js
```

This will:
- Show examples of different ADF structures
- Validate each example
- Test with your JIRA instance (if configured)

## Migration from API v2 to v3

If you're migrating from JIRA Cloud REST API v2 to v3, here are the key changes:

### v2 (Plain Text)
```javascript
{
  "fields": {
    "description": "Plain text description"
  }
}
```

### v3 (ADF Required)
```javascript
{
  "fields": {
    "description": {
      "type": "doc",
      "version": 1,
      "content": [...]
    }
  }
}
```

## Troubleshooting Tips

1. **Check Field Requirements**: Not all fields require ADF. Only certain fields like `description` in issues require ADF format.

2. **Validate ADF Structure**: Use the `isValidADF()` function to ensure your ADF structure is correct.

3. **Use Utility Functions**: Instead of manually creating ADF, use the provided utility functions which handle common cases.

4. **Test Incrementally**: Start with simple text conversion and gradually add more complex formatting.

5. **Check API Version**: Ensure you're using the correct API endpoints (v3 for ADF requirements).

## Resources

- [Atlassian Document Format Documentation](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/)
- [JIRA Cloud REST API v3 Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [ADF Editor for Testing](https://developer.atlassian.com/cloud/jira/platform/apis/document/playground/)

## Common Error Messages and Solutions

### "Operation value must be an Atlassian Document"
**Solution**: Convert your description field to ADF format using `textToADF()`.

### "Invalid ADF structure"
**Solution**: Use `isValidADF()` to validate and check the ADF specification for correct structure.

### "Field 'description' cannot be set"
**Solution**: Ensure you have the correct permissions and the field exists in your project configuration.

### "Content is not valid"
**Solution**: Check that all required ADF properties are present (type, version, content).
