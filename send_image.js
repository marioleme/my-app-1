/* eslint-disable @typescript-eslint/no-require-imports */

require("dotenv").config();
const { execSync } = require("child_process");

// Ensure HTTPS doesn't fail for self-signed certificates (if applicable)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

try {
  // Build the Docker image
  console.log("Building Docker image...");
  execSync(
    `docker build -t ${process.env.IMAGE_NAME}:${process.env.IMAGE_VERSION} -f ${process.env.DOCKERFILE_PATH}/Dockerfile ${process.env.DOCKERFILE_PATH}`,
    { stdio: "inherit" }
  );

  // Log in to the Docker Registry
  console.log("Logging into Docker Registry...");
  execSync(
    `docker login ${process.env.REGISTRY_URL} -u ${process.env.REGISTRY_USER} -p ${process.env.REGISTRY_PASSWORD}`,
    { stdio: "inherit" }
  );

  // Tag the Docker image for the registry
  console.log("Tagging Docker image...");
  execSync(
    `docker tag ${process.env.IMAGE_NAME}:${process.env.IMAGE_VERSION} ${process.env.REGISTRY_URL}/${process.env.IMAGE_NAME}:${process.env.IMAGE_VERSION}`,
    { stdio: "inherit" }
  );

  // Push the Docker image to the registry
  console.log("Pushing Docker image to the registry...");
  execSync(
    `docker push ${process.env.REGISTRY_URL}/${process.env.IMAGE_NAME}:${process.env.IMAGE_VERSION}`,
    { stdio: "inherit" }
  );

  // Trigger the deployment webhook (if available)
  if (process.env.DEPLOY_WEBHOOK_URL) {
    console.log("Triggering deployment webhook...");
    fetch(process.env.DEPLOY_WEBHOOK_URL, {
      method: "POST",
    })
      .then(() => {
        console.log("Deployment webhook triggered successfully!");
      })
      .catch((error) => {
        console.error("Error triggering deployment webhook:", error);
      });
  } else {
    console.log("No deployment webhook URL provided. Skipping webhook step.");
  }

  console.log("Deployment script complete!");
} catch (error) {
  console.error("Error during deployment process:", error.message);
}
