# RAG FAQ Chatbot

## Project Introduction

This project is a modern, interactive RAG (Retrieval-Augmented Generation) FAQ Chatbot built with Next.js and Chakra UI. It features a sleek, user-friendly interface inspired by popular chat applications, designed to provide efficient and dynamic responses to user queries. The chatbot integrates with a backend API (which you would configure to provide RAG capabilities), offering a seamless conversational experience.

## Features

*   **Dynamic Chat Management:** Create new chat sessions, switch between them, and delete old conversations.
*   **Intelligent Chat Titles:** Chat titles are automatically generated based on the first query in each conversation for easy identification.
*   **Professional UI/UX:**
    *   **Sidebar Navigation:** A collapsible sidebar for managing multiple chat sessions, complete with an intuitive hamburger menu.
    *   **Responsive Design:** Optimized for various screen sizes, ensuring a consistent experience across devices.
    *   **Adaptive Theme:** Supports both light and dark modes, with a refined color palette that adapts to user preferences.
    *   **Modern Input & Send:** Stylish, full-rounded input field and a matching send button with clear loading indicators.
    *   **Clean Layout:** Enhanced spacing, consistent border-radius, and removal of distracting hover/outline effects for a polished look.
*   **Loading Indicators:** Provides visual feedback (spinner and "Thinking..." message) while waiting for API responses.
*   **Message Bubbles:** Clearly distinguishes between user queries and chatbot responses with distinct styling.

## Technologies Used

*   **Next.js:** A React framework for building server-side rendered and static web applications.
*   **Chakra UI:** A simple, modular, and accessible component library for React.
*   **@primer/octicons-react:** React components for Primer Octicons, used for various UI icons.

## Project Environment Setup

To get this project up and running on your local machine, follow these steps:

### Prerequisites

Make sure you have Node.js and npm (Node Package Manager) installed.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ren-418/RAG-Chatbot-Pinecone.git
    cd 1.RAG_FAQ_Chatbot
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
    This will install all the necessary packages, including Next.js, Chakra UI, and @primer/octicons-react.

### Running the Development Server

To run the chatbot in development mode:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The page will auto-update as you make changes to the code.

### Building and Running Production Version

To create a production build and run the application:

1. **Build the application:**
   ```bash
   npm run build
   ```
   This creates an optimized production build of your application.

2. **Start the production server:**
   ```bash
   npm run start
   ```
   By default, this will start the server on port 3000. If port 3000 is already in use, you can specify a different port:
   ```bash
   npx next start -p <port-number>
   ```
   For example: `npx next start -p 3001`

The production build is optimized for performance and should be used when deploying to production environments.

### API Integration

This chatbot is designed to interact with a backend API for its RAG capabilities. The core logic for communicating with the API is located in `pages/api/chat.js`.

*   **API Endpoint:** The chatbot makes `POST` requests to `/api/chat`.
*   **Request Body:** It sends a JSON object with a `query` field: `{"query": "your message"}`.
*   **Response Structure:** It expects a JSON response with a `response` field containing the chatbot's message: `{"response": {"response": "chatbot reply"}}`.

You will need to implement or configure your backend API to handle these requests and provide relevant responses based on your RAG setup.

## How it Works

The chatbot functions by capturing user input and sending it to a `/api/chat` endpoint. This endpoint is expected to process the query, potentially interact with a RAG system to retrieve relevant information, and then generate a response. The frontend then displays this response in a conversational format.

The application manages multiple chat sessions locally in the browser's state, allowing users to switch between different conversations without losing context. The UI adapts to both light and dark themes, providing a comfortable viewing experience based on user preference.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
