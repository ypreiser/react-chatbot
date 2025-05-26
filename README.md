# React WhatsApp Chatbot Admin

A modern React application for managing WhatsApp chatbot sessions, bots, chat history, and user/admin dashboards.

## Features

- **Chat Interface:** Start and manage chat sessions with AI, send messages and attachments.
- **System Prompt Editor:** Create, edit, and manage bots for chatbot behavior.
- **WhatsApp Session Management:** Connect/disconnect WhatsApp numbers, scan QR codes, and monitor connection status.
- **Chat History:** View past chat sessions and message details.
- **Admin Dashboard:** Manage users and bots (admin only).
- **Multi-language Support:** English and Hebrew UI.
- **Authentication:** Login and registration flows.

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

```bash
npm install
# or
yarn install
```

### Environment Variables

Create a `.env` file in the project root with:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_CHAT_URL=http://localhost:5000/chat
```

Adjust the URLs as needed for your backend.

### Running the App

```bash
npm run dev
# or
yarn dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

## Project Structure

- `src/pages/ChatInterface` - Main chat UI with file upload support
- `src/pages/SystemPromptForm` - Bot editor form
- `src/pages/Whatsapp` - WhatsApp connection/session management
- `src/pages/ChatHistory` - Chat history and details
- `src/pages/AdminDashboard` - Admin-only dashboard
- `src/components/Header` - Navigation header
- `src/data/translations.js` - UI translations
- `src/constants/api.js` - API endpoint configuration

## Customization

- Update `src/data/translations.js` for additional languages.
- Adjust styles in `src/variables.css` and component CSS files.
