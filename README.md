# StreamTalk

**StreamTalk** is a real-time video calling application built using **Next.js**, **Socket.IO**, and **WebRTC**. This app allows users to connect with each other via live video and audio, offering seamless and interactive communication.

## Features

- **Real-time video and audio calls** using WebRTC.
- **Peer-to-peer communication** through WebRTC.
- **Socket.IO integration** for signaling between clients.
- **Responsive design** built for multiple screen sizes.

## Tech Stack

- **Frontend**: Next.js (React Framework)
- **Backend**: Node.js (with Socket.IO)
- **Real-Time Communication**: WebRTC
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x) or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/marufk21/streamtalk.git
   ```

2. Navigate to the project directory:

   ```bash
   cd streamtalk
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

### Running the Application

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:

   ```
   http://localhost:3000
   ```

3. Ensure your backend Socket.IO server is running on the correct port for signaling.

### Project Structure

- **/pages**: Next.js pages, including the home and video call pages.
- **/components**: Reusable React components, like video call UI.
- **/server**: Backend server handling signaling (Socket.IO).
- **/public**: Static assets like icons or images.

### WebRTC Flow

1. A user initiates or joins a call, and a signaling connection is established via **Socket.IO**.
2. **WebRTC** handles the exchange of media streams (audio/video) directly between peers.
3. **ICE Candidates** and **SDP** (Session Description Protocol) are used to negotiate the connection and media formats.

### Signaling Server (Socket.IO)

The signaling server is now integrated into the Next.js API routes. Socket.IO runs automatically when you start the Next.js development server. The Socket.IO server runs on port 3000 by default.

### Deployment

You can deploy StreamTalk on platforms like **Vercel** (for Next.js apps) and use a backend for the signaling server (e.g.Render).

1. Deploy the Next.js app on **Vercel**.
2. Deploy the signaling server (e.g., Node.js with Socket.IO) separately on any Node-compatible platform.

## Contributing

Feel free to contribute to StreamTalk by submitting pull requests or issues. Your feedback and improvements are welcome!

## License

This project is licensed under the **MIT License**.
