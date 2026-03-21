# Update MCP Configuration (GEMINI.md)

## Purpose
This MCP server is used to manage the registration and configuration of all MCP servers within the Gemini CLI environment.

## Usage for Agents
- Use `add_mcp_server` to register a newly created or updated MCP server in the global `settings.json`.
- This ensures that the new capabilities are available to the agent in subsequent tasks.
- **Important**: This server directly modifies the Gemini CLI's core configuration.

## Pre-requisites
- `settings.json` must exist at `~/.gemini/settings.json`.
- The configuration will be refreshed automatically after a successful update.
