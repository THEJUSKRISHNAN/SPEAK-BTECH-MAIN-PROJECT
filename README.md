# SPEAK: Sign Processing & Enhanced Audio Kommunicator

### Real-Time AI Communication Bridge for Deaf & Hearing Users

SPEAK is a state-of-the-art, full-stack real-time communication platform designed to seamlessly bridge the gap between deaf or hard-of-hearing individuals and hearing individuals. By combining WebRTC video calling, WebSockets, computer vision-based sign language recognition (DETR), advanced Text-to-Speech (Microsoft SpeechT5), and Speech-to-Text (OpenAI Whisper), SPEAK translates communication channels dynamically in real-time.

---

## 🚀 Key Features

*   **⚡ WebRTC High-Definition Video Calling:** Low-latency peer-to-peer audio and video transmission built on standard WebRTC protocols, utilizing Flask-SocketIO for signaling. Features dynamic UI controls for managing call state (toggle mic, toggle video, decline calls, call logging).
*   **🖐️ Real-time Sign Language Recognition (Computer Vision):** Captures the deaf user's video stream, processes it frame-by-frame on the Flask server, and uses a custom-trained **DETR (DEtection TRansformer)** model in PyTorch to detect 11 distinct sign gestures:
    *   *break, book, congratulations, goodmorning, hello, home, iloveyou, mistake, please, quiet, thankyou*
*   **🗣️ Auto-Generated Speech (TTS):** When a sign gesture is detected, the platform dynamically generates natural-sounding speech audio via **Microsoft SpeechT5** and broadcasts it to the hearing user. A custom-built caching and cooldown mechanism prevents redundant audio overlaps.
*   **✍️ Dynamic Text-to-Speech Keyboard:** Deaf users can type messages manually, which are converted into high-fidelity voice audio on the fly using **SpeechT5** with **Hifi-GAN vocoder** synthesis, providing a vocal presence during calls.
*   **📝 Live Speech-to-Text Captions (STT):** Captures the hearing user's voice, transcribes it in real-time using **OpenAI Whisper (base)**, and streams live captions to the deaf user's screen instantly via WebSockets.
*   **👥 User Accounts & Dashboard:** Full registration, secure login with JWT authentication, recent call history aggregation from **MongoDB**, and cloud-stored profile images using **Cloudinary**.

---

## 🛠️ Tech Stack

### Frontend
*   **Library:** React 19 & React DOM
*   **Styling:** Tailwind CSS v4 (using `@tailwindcss/vite` integration)
*   **Routing:** React Router DOM v7
*   **State Management:** Redux Toolkit & React-Redux
*   **Real-time Communication:** Socket.io-client (WebSockets) & WebRTC signaling
*   **UI Extras:** React Icons, React Toastify, Zod (Schema validation), Date-fns

### Backend
*   **Core Framework:** Flask & Flask-CORS (Python 3.x)
*   **WebSockets:** Flask-SocketIO (backed by `eventlet` production server)
*   **Database:** MongoDB via Flask-PyMongo
*   **Cloud Storage:** Cloudinary (profile picture hosting)
*   **Security:** Bcrypt (password hashing) & PyJWT (JSON Web Token auth)
*   **AI & Deep Learning:**
    *   **PyTorch (`torch`, `torchvision`, `torchaudio`)**: Core deep learning architecture
    *   **OpenAI Whisper**: Speech-to-Text transcription engine
    *   **Hugging Face Transformers**: Microsoft SpeechT5 & Hifi-GAN synthesis
    *   **OpenCV & Albumentations**: Image frame processing & transformations

# Project Documents

| Document | Link |
|----------|------|
| Project Report | [View Report](./docs/SPEAK_REPORT.pdf) |
| Presentation PPT | [View PPT](./docs/SPEAK_PPT.pptx) |
| IJERA Paper | [View Paper](./docs/SPEAK_IJERA.pdf) |
| Demo Video | [Watch Video](https://drive.google.com/file/d/1fHz0VTekK8UJVcT6WzvTTT6rznFkvgnQ/view?usp=drive_link) |
---

## 📂 Project Structure

```text
SPEAK-BTECH-MAIN-PROJECT/
├── backend/
│   ├── ai/                      # AI models, custom PyTorch weights, and utilities
│   │   ├── 11_words.pt          # DETR model checkpoint weights (11 classes)
│   │   ├── 6_words.pt           # DETR model checkpoint weights (6 classes)
│   │   ├── 99_model.pt          # Main model weights
│   │   ├── model.py             # DETR PyTorch model architecture definition
│   │   └── utils/
│   ├── routes/                  # API and WebSocket routes
│   │   ├── api_routes.py        # Profiles, aggregation queries, and calls
│   │   ├── auth_routes.py       # JWT Signup and Login endpoints
│   │   ├── sign_detector.py     # Image decoding and DETR inference pipeline
│   │   ├── socket_routes.py     # WebSocket signaling, WebRTC setup, and TTS/STT pipelines
│   │   ├── stt_routes.py        # OpenAI Whisper transcription engine
│   │   └── tts.py               # Hugging Face SpeechT5 audio synthesis
│   ├── utils/                   # Shared backend utility functions
│   ├── app.py                   # App factory, blueprints, and server entrypoint
│   ├── config.py                # Environment configuration settings
│   ├── extensions.py            # Extensions instantiation (Mongo, SocketIO, Bcrypt)
│   ├── requirements.txt         # Backend Python dependencies
│   └── .env                     # Backend local credentials (ignored by git)
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable React layout components (Navbar, buttons, modals)
│   │   ├── context/             # SocketContext providers
│   │   ├── pages/               # Page components
│   │   │   ├── LandingPage.jsx  # Landing/marketing page
│   │   │   ├── AboutPage.jsx    # Project background information
│   │   │   ├── LoginPage.jsx    # Secure login page
│   │   │   ├── RegisterPage.jsx # Sign-up page with "Is Deaf" selection
│   │   │   ├── DashboardPage.jsx# Online user lists, recent call histories
│   │   │   ├── ProfilePage.jsx  # Profile detail updates with image uploader
│   │   │   └── CallPage.jsx     # WebRTC calling workspace & AI translation suite
│   │   ├── store/               # Redux state configurations
│   │   ├── App.jsx              # Main routing engine
│   │   └── main.jsx             # React DOM renderer
│   ├── vite.config.js           # Vite development and build settings
│   ├── tailwind.config.js       # Custom Tailwind directives
│   ├── package.json             # Frontend Node packages
│   └── .env                     # Frontend configuration (VITE_API_URL)
│
└── README.md                    # Project documentation (this file)
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   **Python:** v3.8 or higher
*   **Node.js:** v18 or higher (with `npm`)
*   **MongoDB:** Local instance running or MongoDB Atlas cluster url
*   **Cloudinary Account:** For hosting profile images
*   **FFmpeg:** Required on backend host path for audio conversion (Whisper STT)

---

### 🐍 Backend Setup

1.  **Navigate to backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # On Windows (PowerShell):
    .\venv\Scripts\Activate.ps1
    # On macOS/Linux:
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    *Note: If running on a GPU-enabled host, install PyTorch with CUDA support first.*
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables (`.env`):**
    Create a `.env` file inside the `backend` folder and insert your credentials:
    ```env
    SECRET_KEY=your_super_secret_jwt_key
    MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/speak_db?retryWrites=true&w=majority
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

5.  **Start the Backend Server:**
    ```bash
    python app.py
    ```
    The server will startup on [http://localhost:5001](http://localhost:5001).

---

### 💻 Frontend Setup

1.  **Navigate to frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install Node dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables (`.env`):**
    Create a `.env` file inside the `frontend` folder:
    ```env
    VITE_API_URL=http://localhost:5001
    ```

4.  **Launch Frontend in Dev Mode:**
    ```bash
    npm run dev
    ```
    The frontend client will open on [http://localhost:5173](http://localhost:5173).

---

## ⚙️ Socket.io Events & API Spec

### Core Socket Events
*   `user_online` (incoming): Registers user as online with their `socket_id`.
*   `get_online_users` (incoming): Requests active list of online users.
*   `call-user` (incoming/outgoing): Initiates peer signaling, passing SDP offer.
*   `answer-call` (incoming/outgoing): Completes peer signaling, logs call database record, and passes SDP answer.
*   `process-frame` (incoming): Receives live image frame (Base64) from Deaf user's camera, runs DETR prediction, and pushes back translation.
*   `play-audio-message` (outgoing): Emits high-quality SpeechT5 base64 synthesized audio string to the recipient.
*   `stt-result` (incoming/outgoing): Pushes Whisper-transcribed speech string to the Deaf client.

### Key API Endpoints
*   `POST /api/auth/register`: Create user account with attributes `name, email, password, isDeaf`.
*   `POST /api/auth/login`: Validates credentials and returns signed JWT token containing profile data.
*   `PUT /api/profile/update` (Protected): Uploads profile image file to Cloudinary and updates DB details.
*   `GET /api/calls/recent` (Protected): Returns the 10 most recent voice/video conversations using MongoDB pipelines.
*   `POST /api/stt/transcribe` (Protected): Converts incoming WebM audio recording to a Wav file, passes it to OpenAI Whisper, and returns transcribed English text.

---
