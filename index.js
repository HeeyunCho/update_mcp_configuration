"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const SETTINGS_PATH = path.join(os.homedir(), ".gemini", "settings.json");
const server = new index_js_1.Server({ name: "update-mcp-configuration", version: "1.0.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
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
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === "add_mcp_server") {
        if (!fs.existsSync(SETTINGS_PATH)) {
            return { content: [{ type: "text", text: `Error: settings.json not found at ${SETTINGS_PATH}` }], isError: true };
        }
        const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
        if (!settings.mcpServers)
            settings.mcpServers = {};
        const server_name = args?.server_name;
        settings.mcpServers[server_name] = {
            command: args?.command,
            args: args?.args,
            cwd: args?.cwd,
            env: args?.env
        };
        // Clean up optional fields if they are null/undefined
        if (!settings.mcpServers[server_name].cwd)
            delete settings.mcpServers[server_name].cwd;
        if (!settings.mcpServers[server_name].env)
            delete settings.mcpServers[server_name].env;
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
        return { content: [{ type: "text", text: `Successfully updated ${server_name} in ${SETTINGS_PATH}. The configuration will be refreshed automatically.` }] };
    }
    throw new Error("Tool not found");
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
