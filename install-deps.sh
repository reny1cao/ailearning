#!/bin/bash

echo "Installing dependencies for AI Learning Platform..."

# Make sure pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

# Install root dependencies
echo "Installing root dependencies..."
pnpm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating default .env file..."
    echo "# DeepSeek API configuration" > .env
    echo "DEEPSEEK_API_KEY=your_api_key_here" >> .env
    echo "DEEPSEEK_API_URL=https://api.deepseek.com/v1" >> .env
    echo "PORT=3001" >> .env
    echo "CORS_ORIGIN=http://localhost:5173" >> .env
    echo "NODE_ENV=development" >> .env
    echo ".env file created. Please update with your actual API key."
fi

# Install dependencies for each workspace
echo "Installing client dependencies..."
cd client && pnpm install
cd ..

echo "Installing server dependencies..."
cd server && pnpm install
cd ..

echo "Installing shared dependencies..."
cd shared && pnpm install
cd ..

echo "All dependencies installed successfully!"
echo "You can now run 'pnpm run dev' to start the development servers."