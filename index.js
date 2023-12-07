import { google } from "googleapis";
import * as fs from "fs";
import * as process from "process";
import * as readline from "node:readline/promises";
import "dotenv/config";

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const scopes = ["https://www.googleapis.com/auth/drive"];

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

console.log("Open the following URL in a browser to authorize:");
console.log(authorizationUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const errorUrl = await rl.question("Enter the error URL: ");
let code = "";
const parts = errorUrl.split("?");
for (let part of parts) {
  if (part.includes("code=")) {
    code = part.slice(5, part.indexOf("&", 5));
  }
}

console.log("code: " + code);

oauth2Client.getToken(code, (err, tokens) => {
  if (err) {
    console.error("Error getting tokens:", err);
    console.error("Error data:", err.response?.data);
    process.exit(1);
  } else {
    const filePath = "tokens.json";

    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      // If it exists, overwrite it
      fs.writeFileSync(filePath, JSON.stringify(tokens));
      console.log("Tokens overwritten in tokens.json");
    } else {
      // If it doesn't exist, create a new file
      fs.writeFileSync(filePath, JSON.stringify(tokens));
      console.log("Tokens saved to tokens.json");
    }
    process.exit(0);
  }
});
