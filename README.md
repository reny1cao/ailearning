# AI Teaching Platform

A personalized AI learning experience that adapts to individual learning styles and knowledge levels. This platform leverages an advanced memory system to track user progress and a sophisticated teaching strategy engine to deliver content in the most effective way for each learner.

## Quick Start

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies 
./install-deps.sh

# Start the development servers
pnpm run dev
```

See [SETUP.md](SETUP.md) for detailed setup instructions.

## Project Structure

This project is organized as a monorepo with the following components:

- **client**: Frontend React application
- **server**: Backend Express API
- **shared**: Shared types and utilities

## Features

- 🧠 **Personalized Learning**: Adapts to individual learning styles and preferences
- 📚 **Concept Extraction**: Identifies key concepts in user questions and course content
- 📈 **Memory Management**: Tracks user knowledge and identifies knowledge gaps
- 🎯 **Teaching Strategies**: Uses different teaching approaches based on user learning style
- 🔄 **Feedback Loop**: Continuously improves based on user interactions and feedback

## AI Teacher System Architecture

The AI teacher system consists of several integrated components:

### Memory Management

- **User Memory Manager**: Tracks learning styles, concept mastery, and interaction history
- **In-Memory Database**: Stores user profiles and learning progress (to be replaced with a real database in production)

### Concept Management

- **Concept Extractor**: Identifies concepts from text and manages concept relationships
- **Concept Relationships**: Maps relationships between concepts (prerequisites, related concepts, etc.)

### Teaching Strategies

- **Teaching Strategist**: Selects appropriate teaching approaches based on learning styles
- **Strategy Generation**: Creates personalized teaching prompts for different learning styles

### API Layer

- **Teacher Routes**: RESTful endpoints for interacting with the AI teaching system
- **API Client**: Frontend interface for communicating with the backend

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm package manager

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/ailearning.git
   cd ailearning
   ```

2. Install dependencies
   ```
   ./install-deps.sh
   ```

3. Start development servers
   ```
   pnpm run dev
   ```

### Development

Run both client and server in development mode:
```
pnpm run dev
```

Or run them separately:
```
pnpm run dev:client
pnpm run dev:server
```

### Building for Production

```
pnpm run build
```

## API Endpoints

### AI Teacher API

- `POST /api/teacher/interact`: Process a user message and generate a teaching response
- `GET /api/teacher/strategies`: Get available teaching strategies
- `PUT /api/teacher/learning-style`: Update user learning style
- `POST /api/teacher/feedback`: Submit feedback on teaching effectiveness

## Future Improvements

- **Real Database Integration**: Replace in-memory database with PostgreSQL/MongoDB
- **Vector Embeddings**: Add similarity search for concept retrieval and interaction history
- **LLM Integration**: Connect to LLM APIs for more sophisticated responses
- **User Authentication**: Add proper user authentication and session management
- **Analytics Dashboard**: Provide insights into learning progress and patterns

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspired by advancements in personalized learning and AI education 