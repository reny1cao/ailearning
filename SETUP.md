
# AI Learning Platform Setup Guide

## Prerequisites

- Node.js 18 or higher
- pnpm package manager

## Setting Up the Development Environment

### 1. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### 2. Install Dependencies

You can use our automated setup script:

```bash
./install-deps.sh
```

Or manually install dependencies:

```bash
# Install root dependencies
pnpm install

# Install workspace dependencies
pnpm --filter llm-course-platform install
pnpm --filter ailearning-server install
pnpm --filter ailearning-shared install
```

### 3. Configure Environment Variables

The project already includes a .env file with a test DeepSeek API key. For development, you can use this key, but for production, you should replace it with your own:

```
DEEPSEEK_API_KEY=sk-a9a694f463d7491bacae3d5ab4070b2a  # Use this test key for development only
DEEPSEEK_API_URL=https://api.deepseek.com/v1
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### 4. Start Development Servers

```bash
pnpm run dev
```

This will start both the client (frontend) and server (backend) in development mode.

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Health Check: http://localhost:3001/health

## Troubleshooting

### "Command not found" errors

If you see errors like `vite: command not found` or `ts-node-dev: command not found`, it means the dependencies are not properly installed. Run the `install-deps.sh` script to fix this.

### pnpm workspace issues

If you encounter workspace-related errors, make sure:
1. You have a valid `pnpm-workspace.yaml` file in the root directory
2. The project names in the package.json files match what's in the scripts (llm-course-platform, ailearning-server)

### API Connection Issues

If the frontend can't connect to the backend, check:
1. That both servers are running
2. The CORS configuration in the server
3. The API URL in the client configuration

## Project Structure

```
ailearning/
├── client/             # Frontend React application (package: llm-course-platform)
├── server/             # Backend Express server (package: ailearning-server)
├── shared/             # Shared TypeScript types (package: ailearning-shared)
├── pnpm-workspace.yaml # Workspace configuration
└── package.json        # Root package.json
``` 