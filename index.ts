import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const SETTINGS_PATH = path.join(os.homedir(), ".gemini", "settings.json");

const server = new Server(
  { name: "update-mcp-configuration", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "add_mcp_server",
        description: "Add or update an MCP server configuration in settings.json",
        inputSchema: {
          type: "object",
          properties: {
            server_name: { type: "string", description: "The unique name of the MCP server" },
            command: { type: "string", description: "The command to run (e.g., 'node', 'npx')" },
            args: { type: "array", items: { type: "string" }, description: "Arguments for the command" },
            cwd: { type: "string", description: "The working directory for the server (optional)" },
            env: { type: "object", additionalProperties: { type: "string" }, description: "Environment variables (optional)" }
          },
          required: ["server_name", "command", "args"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "add_mcp_server") {
    if (!fs.existsSync(SETTINGS_PATH)) {
        return { content: [{ type: "text", text: `Error: settings.json not found at ${SETTINGS_PATH}` }], isError: true };
    }

    const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
    if (!settings.mcpServers) settings.mcpServers = {};

    const server_name = args?.server_name as string;
    settings.mcpServers[server_name] = {
        command: args?.command,
        args: args?.args,
        cwd: args?.cwd,
        env: args?.env
    };

    // Clean up optional fields if they are null/undefined
    if (!settings.mcpServers[server_name].cwd) delete settings.mcpServers[server_name].cwd;
    if (!settings.mcpServers[server_name].env) delete settings.mcpServers[server_name].env;

    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    
    return { content: [{ type: "text", text: `Successfully updated ${server_name} in ${SETTINGS_PATH}. The configuration will be refreshed automatically.` }] };
  }

  throw new Error("Tool not found");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
