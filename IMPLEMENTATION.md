# IMPLEMENTATION: Update MCP Configuration

## Overview
A configuration management server that modifies the global `settings.json` file used by Gemini CLI.

## Tools (Methods)

### 1. `add_mcp_server`
**Description**: Adds or updates an MCP server entry in `settings.json`.
- **Parameters**:
  - `server_name` (string): Unique identifier.
  - `command` (string): Execution command (e.g., `node`).
  - `args` (array of strings): Command arguments.
  - `cwd` (string, optional): Working directory.
  - `env` (object, optional): Environment variables.
- **Returns**: Confirmation and location of the updated settings file.

## Configuration Details
- **Settings Path**: `~/.gemini/settings.json`.
- **Auto-Cleanup**: Automatically removes optional fields if they are null or undefined to keep the JSON clean.
- **Persistence**: Writes the entire `settings.json` back to disk after modification.
