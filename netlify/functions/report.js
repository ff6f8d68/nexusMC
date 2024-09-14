const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Define the GitHub token and other constants
const TOKEN = "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";
const FILE_PATH = path.join(__dirname, '/reports.json');
const OWNER = 'ff6f8d68'; // GitHub username or organization
const REPO = 'nexusMC'; // GitHub repository name
const BRANCH = 'main'; // Branch to update (use 'main' or 'master', depending on your repo)

// Helper function to read the JSON file
function readJSONFile() {
  const data = fs.readFileSync(FILE_PATH);
  return JSON.parse(data);
}

// Helper function to write to the JSON file
function writeJSONFile(content) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(content, null, 2));
}

// Get the content of the file in base64 format
function getBase64Content(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return Buffer.from(fileContent).toString('base64');
}

// Function to upload the file to GitHub
async function uploadToGitHub(contentBase64, sha = null) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/reports.json`;

  // Construct the request body
  const body = {
    message: 'Update reports.json',
    content: contentBase64,
    branch: BRANCH,
  };

  // If the file already exists, include its SHA to update it
  if (sha) {
    body.sha = sha;
  }

  // Make the request to GitHub
  return axios.put(url, body, {
    headers: {
      Authorization: `token ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
}

// Function to get the SHA of an existing file (if it exists)
async function getFileSHA() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/reports.json`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${TOKEN}`,
      },
    });
    return response.data.sha; // Return the SHA of the file
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // File doesn't exist yet
    }
    throw error;
  }
}

exports.handler = async (event, context) => {
  try {
    const { addcontent, component, ...newData } = event.queryStringParameters;
    
    // Read the current reports.json file
    const jsonContent = readJSONFile();

    // Add new report content to reports.json
    if (addcontent) {
      const contentToAdd = JSON.parse(addcontent);

      // Ensure 'status' field is present
      if (!contentToAdd.status) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'The added content must include a status field' })
        };
      }

      // Use the name of the report (e.g., report1, report2) as the key
      const reportName = contentToAdd.name;

      if (!reportName) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'The added content must include a name field' })
        };
      }

      // Initialize messages if not present
      if (!contentToAdd.messages) {
        contentToAdd.messages = {};
      }

      // Add or update the report in the JSON object
      jsonContent[reportName] = {
        status: contentToAdd.status,
        messages: contentToAdd.messages
      };
      writeJSONFile(jsonContent);
    }

    // Modify an existing report's status or messages in reports.json
    if (component) {
      const targetReport = jsonContent[component];

      if (!targetReport) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Component '${component}' not found` })
        };
      }

      // Modify specific keys
      for (const key in newData) {
        if (newData.hasOwnProperty(key)) {
          if (key === 'status') {
            targetReport.status = newData[key];
          } else if (key.startsWith('message_')) {
            const messageKey = key.replace('message_', '');
            if (!targetReport.messages) {
              targetReport.messages = {};
            }
            targetReport.messages[messageKey] = newData[key];
          }
        }
      }

      writeJSONFile(jsonContent);
    }

    // Get the file content in base64
    const contentBase64 = getBase64Content(FILE_PATH);

    // Get the SHA of the existing file (if it exists)
    const sha = await getFileSHA();

    // Upload the file to GitHub
    await uploadToGitHub(contentBase64, sha);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File updated successfully on GitHub' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
    };
  }
};
