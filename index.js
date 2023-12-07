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

const code = await rl.question("Enter the code in URL: ");

console.log("code: " + code);

if (code == "") {
  console.log("CODE EMPTY...");
  process.exit(1);
}

try {
  const tokens = await oauth2Client.getToken(code);
  const filePath = "tokens.json";

  if (fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(tokens.tokens));
    console.log("Tokens overwritten in tokens.json");
  } else {
    fs.writeFileSync(filePath, JSON.stringify(tokens.tokens));
    console.log("Tokens saved to tokens.json");
  }
  process.exit(0);
} catch (err) {
  console.error("Error getting tokens:", err);
  process.exit(1);
}
