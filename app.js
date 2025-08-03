// app.js
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

// Import JIRA service functions
const createIssue = require("./create-issue");
const createProject = require("./create-project");
const getIssues = require("./get-issues");
const getProjects = require("./get-projects");
const getUsers = require("./get-users");
const getIssueByID = require("./get-issue-by-id");
const deleteIssueByID = require("./delete-issue-by-id");
const getTransitions = require("./get-transitions");
const updateStatus = require("./update-status");

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

const PORT = process.env.PORT || 3000;

// --- Swagger/OpenAPI Configuration ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "JIRA Cloud REST API Integration",
      version: "1.0.0",
      description:
        "A comprehensive Express.js API wrapper for JIRA Cloud REST API v3. This API provides endpoints to manage JIRA projects, issues, users, and workflows with full documentation and error handling.",
      contact: {
        name: "API Support",
        url: "https://github.com/horeaporutiu/JIRA-Cloud-REST-API-Tutorial",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Issue: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the issue",
              example: "10001",
            },
            key: {
              type: "string",
              description: "Issue key (PROJECT-123)",
              example: "PROJ-123",
            },
            self: {
              type: "string",
              description: "URL to the issue",
              example: "https://your-domain.atlassian.net/rest/api/3/issue/10001",
            },
            fields: {
              type: "object",
              description: "Issue fields including summary, description, status, etc.",
            },
          },
        },
        Project: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the project",
              example: "10000",
            },
            key: {
              type: "string",
              description: "Project key",
              example: "PROJ",
            },
            name: {
              type: "string",
              description: "Project name",
              example: "My Project",
            },
            projectTypeKey: {
              type: "string",
              description: "Type of project",
              example: "software",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            accountId: {
              type: "string",
              description: "Unique account identifier",
              example: "5b10a2844c20165700ede21g",
            },
            displayName: {
              type: "string",
              description: "User's display name",
              example: "John Doe",
            },
            emailAddress: {
              type: "string",
              description: "User's email address",
              example: "john.doe@example.com",
            },
            active: {
              type: "boolean",
              description: "Whether the user account is active",
              example: true,
            },
          },
        },
        Transition: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Transition ID",
              example: "11",
            },
            name: {
              type: "string",
              description: "Transition name",
              example: "To Do",
            },
            to: {
              type: "object",
              description: "Target status",
              properties: {
                id: {
                  type: "string",
                  example: "10000",
                },
                name: {
                  type: "string",
                  example: "To Do",
                },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
              example: "Bad Request. Missing required fields",
            },
            error: {
              type: "string",
              description: "Detailed error information",
              example: "Field 'summary' is required",
            },
          },
        },
      },
    },
  },
  apis: ["./app.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// --- Serve Swagger UI Documentation ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- API Endpoints with JSDoc for Swagger ---

/**
 * @swagger
 * tags:
 *   - name: Issues
 *     description: API for managing JIRA issues
 *   - name: Projects
 *     description: API for managing JIRA projects
 *   - name: Users
 *     description: API for managing JIRA users
 *   - name: Workflows
 *     description: API for managing issue workflows and transitions
 */

/**
 * @swagger
 * /issues:
 *   post:
 *     summary: Create a new JIRA issue
 *     tags: [Issues]
 *     description: Creates a new issue within a specified project. All fields in the request body are required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectKey
 *               - issueType
 *               - summary
 *               - description
 *             properties:
 *               projectKey:
 *                 type: string
 *                 description: The key of the project where the issue will be created
 *                 example: "PROJ"
 *               issueType:
 *                 type: string
 *                 description: The type of the issue (e.g., Task, Bug, Story)
 *                 example: "Task"
 *               summary:
 *                 type: string
 *                 description: A brief, one-line summary of the issue
 *                 example: "Implement new login button"
 *               description:
 *                 type: string
 *                 description: A detailed description of the issue (plain text will be automatically converted to Atlassian Document Format)
 *                 example: "The login button on the main page needs to be updated to the new brand color and font."
 *     responses:
 *       '201':
 *         description: Issue created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Issue created successfully"
 *                 issueKey:
 *                   type: string
 *                   example: "PROJ-123"
 *       '400':
 *         description: Bad Request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/issues", async (req, res) => {
  const { projectKey, issueType, summary, description } = req.body;

  // Comprehensive validation
  const missingFields = [];
  if (!projectKey) missingFields.push("projectKey");
  if (!issueType) missingFields.push("issueType");
  if (!summary) missingFields.push("summary");
  if (!description) missingFields.push("description");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Bad Request. Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    const issueKey = await createIssue(projectKey, issueType, summary, description);
    res.status(201).json({
      message: "Issue created successfully",
      issueKey: issueKey,
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({
      message: "Internal Server Error. Failed to create issue.",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /issues:
 *   get:
 *     summary: Retrieve all issues
 *     tags: [Issues]
 *     description: Retrieves a list of all issues from JIRA using the search endpoint. Optionally filter by project ID.
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         required: false
 *         description: Project ID or key to filter issues by specific project
 *         example: "PROJ"
 *     responses:
 *       '200':
 *         description: Successfully retrieved issues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 issues:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Issue'
 *                 total:
 *                   type: integer
 *                   description: Total number of issues
 *                 startAt:
 *                   type: integer
 *                   description: Starting index of the returned results
 *                 maxResults:
 *                   type: integer
 *                   description: Maximum number of results returned
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/issues", async (req, res) => {
  try {
    const { projectId } = req.query;
    const issues = await getIssues(projectId);
    res.json(issues);
  } catch (error) {
    console.error("Error getting issues:", error);
    res.status(500).json({
      message: "Error getting issues",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /issues/{issueKey}:
 *   get:
 *     summary: Retrieve a specific issue by key
 *     tags: [Issues]
 *     description: Retrieves detailed information about a specific issue using its key
 *     parameters:
 *       - in: path
 *         name: issueKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The issue key (e.g., PROJ-123)
 *         example: "PROJ-123"
 *     responses:
 *       '200':
 *         description: Successfully retrieved issue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Issue'
 *       '404':
 *         description: Issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/issues/:issueKey", async (req, res) => {
  const { issueKey } = req.params;

  if (!issueKey) {
    return res.status(400).json({
      message: "Issue key is required",
    });
  }

  try {
    const issue = await getIssueByID(issueKey);
    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }
    res.json(issue);
  } catch (error) {
    console.error("Error getting issue:", error);
    res.status(500).json({
      message: "Error getting issue",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /issues/{issueKey}:
 *   delete:
 *     summary: Delete an issue by key
 *     tags: [Issues]
 *     description: Permanently deletes an issue from JIRA
 *     parameters:
 *       - in: path
 *         name: issueKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The issue key (e.g., PROJ-123)
 *         example: "PROJ-123"
 *     responses:
 *       '204':
 *         description: Issue deleted successfully
 *       '404':
 *         description: Issue not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete("/issues/:issueKey", async (req, res) => {
  const { issueKey } = req.params;

  if (!issueKey) {
    return res.status(400).json({
      message: "Issue key is required",
    });
  }

  try {
    await deleteIssueByID(issueKey);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting issue:", error);
    res.status(500).json({
      message: "Error deleting issue",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /issues/{issueKey}/transitions:
 *   get:
 *     summary: Get available transitions for an issue
 *     tags: [Workflows]
 *     description: Retrieves all available transitions for a specific issue
 *     parameters:
 *       - in: path
 *         name: issueKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The issue key (e.g., PROJ-123)
 *         example: "PROJ-123"
 *     responses:
 *       '200':
 *         description: Successfully retrieved transitions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transitions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transition'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/issues/:issueKey/transitions", async (req, res) => {
  const { issueKey } = req.params;

  if (!issueKey) {
    return res.status(400).json({
      message: "Issue key is required",
    });
  }

  try {
    const transitions = await getTransitions(issueKey);
    res.json(transitions);
  } catch (error) {
    console.error("Error getting transitions:", error);
    res.status(500).json({
      message: "Error getting transitions",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /issues/{issueKey}/transitions:
 *   post:
 *     summary: Transition an issue to a new status
 *     tags: [Workflows]
 *     description: Transitions an issue from one status to another using a transition ID
 *     parameters:
 *       - in: path
 *         name: issueKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The issue key (e.g., PROJ-123)
 *         example: "PROJ-123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transitionId
 *             properties:
 *               transitionId:
 *                 type: string
 *                 description: The ID of the transition to execute
 *                 example: "11"
 *     responses:
 *       '204':
 *         description: Issue status updated successfully
 *       '400':
 *         description: Bad Request - Missing transition ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/issues/:issueKey/transitions", async (req, res) => {
  const { issueKey } = req.params;
  const { transitionId } = req.body;

  if (!issueKey) {
    return res.status(400).json({
      message: "Issue key is required",
    });
  }

  if (!transitionId) {
    return res.status(400).json({
      message: "Transition ID is required",
    });
  }

  try {
    const status = await updateStatus(issueKey, transitionId);
    if (status === 204) {
      res.status(204).send();
    } else {
      res.status(200).json({ message: "Issue status updated successfully" });
    }
  } catch (error) {
    console.error("Error updating issue status:", error);
    res.status(500).json({
      message: "Error updating issue status",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Retrieve all projects
 *     tags: [Projects]
 *     description: Retrieves a list of recent projects from JIRA
 *     responses:
 *       '200':
 *         description: Successfully retrieved projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/projects", async (req, res) => {
  try {
    const projects = await getProjects();
    res.json(projects);
  } catch (error) {
    console.error("Error getting projects:", error);
    res.status(500).json({
      message: "Error getting projects",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new JIRA project
 *     tags: [Projects]
 *     description: Creates a new project in JIRA with the specified name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
 *             properties:
 *               projectName:
 *                 type: string
 *                 description: The name of the project to create
 *                 example: "My New Project"
 *     responses:
 *       '201':
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project created successfully"
 *                 projectKey:
 *                   type: string
 *                   example: "PROJ"
 *       '400':
 *         description: Bad Request - Missing project name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/projects", async (req, res) => {
  const { projectName } = req.body;

  if (!projectName) {
    return res.status(400).json({
      message: "Project name is required",
    });
  }

  try {
    const projectKey = await createProject(projectName);
    res.status(201).json({
      message: "Project created successfully",
      projectKey: projectKey,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      message: "Error creating project",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Users]
 *     description: Retrieves a list of users from JIRA
 *     responses:
 *       '200':
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get("/users", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      message: "Error getting users",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API health check
 *     tags: [Health]
 *     description: Returns basic information about the API
 *     responses:
 *       '200':
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "JIRA Cloud REST API Integration is running!"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-12-07T10:30:00.000Z"
 */
app.get("/", (req, res) => {
  res.json({
    message: "JIRA Cloud REST API Integration is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    documentation: `http://localhost:${PORT}/api-docs`,
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API documentation is available at http://localhost:${PORT}/api-docs`);
  console.log(`🔧 JIRA Cloud REST API v3 Integration Ready`);
});
