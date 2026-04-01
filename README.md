# Aura AI - E-commerce Operations Dashboard

A full-stack React application with an Express backend, featuring AI-driven event interception, SMS fallbacks via Brevo, and a real-time analytics dashboard.

## Features

- **Real-Time Dashboard:** Monitor e-commerce events like abandoned carts in real-time.
- **AI-Powered Interception (Aura AI):** Automatically intercepts critical events and determines the best course of action.
- **Automated SMS Fallbacks:** Integrates with Brevo to send transactional SMS messages (e.g., abandoned cart recovery) using E.164 formatted phone numbers.
- **Full-Stack Architecture:** Built with React 19, Vite, Tailwind CSS, and an Express.js backend.
- **Containerized:** Fully Dockerized ecosystem with `docker-compose` for seamless deployment and persistent data volumes.

## Prerequisites

- Node.js (v22 or higher recommended)
- Docker and Docker Compose (for containerized deployment)
- A Brevo account (for SMS and Event Tracking)
- Gemini API Key (for AI features)

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory and add your API keys and configuration. Refer to `.env.example` if available.

```env
GEMINI_API_KEY=your_gemini_api_key
# Add other required environment variables (e.g., Brevo API keys)
```

### 3. Run Locally (Development)

To start the development server (which runs both the Vite frontend and Express backend concurrently):

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 4. Run with Docker (Production/Staging)

To run the application in an isolated containerized environment:

```bash
docker-compose up --build -d
```

This will build the image and start the container in the background. Your data (like `audit_logs.json` and `chat_backups.json`) will be persisted via Docker volumes.

To stop the container:

```bash
docker-compose down
```

## Credits

- **Luis Villeda** (`lvilleda7k@gmail.com`) - Creator & Lead Developer
