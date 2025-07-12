# SnipStrike – Competitive Programming Battles & Practice Platform

This is the backend system for SnipStrike, a Codeforces-powered platform enabling competitive programming battles, personalized practice sessions, and real-time notifications. The backend is built with Node.js, Express, MongoDB, and integrates the Codeforces API to deliver a seamless and scalable experience for programmers.

# Core Idea

SnipStrike is a backend system built to support a competitive programming platform powered by the Codeforces API. It enables users to participate in 1v1 coding matches and focused practice sessions, all while tracking performance and progress in real-time. The system handles match logic, filtered problem recommendations, session tracking, and real-time user engagement through notifications—building a fast, skill-based, and educational environment for programmers.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Features](#features)
- [License](#-inspiration-only--not-for-use)
- [Contact](#contact)
- [Author](#author)

## Installation & Setup

### 1. Clone the Repository

```bash

git clone https://github.com/lokesh-7139/SnipStrike.git
cd SnipStrike
```

### 2. Install dependencies

```bash

npm install
```

### 3. Configure Environment Variables

Create a .env file in the root directory and add your environment variables.

```env

NODE_ENV=development
PORT=4500

# MongoDB connection
DATABASE=mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.mongodb.net/your-db-name?retryWrites=true&w=majority
DATABASE_PASSWORD=yourMongoDBPassword

# JWT configuration
JWT_SECRET=any_thing#you$want%%
JWT_EXPIRES_IN=10d
JWT_COOKIE_EXPIRES_IN=10
RETRY_ATTEMPTS=5

# Nodemailer SMTP
EMAIL_USERNAME=youremail@gmail.com
EMAIL_PASSWORD=your-email-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM=Outdoors App <youremail@gmail.com>

# SendGrid API
SENDGRID_API_KEY=SG.xxxxxx.yyyyyyyyyyyyyyyyyyyyyy

```

### 4. Run the Server

To start the development server with auto-restart (using Nodemon):

```bash

npm run dev
```

To run the server in production mode:

```bash

npm start
```

Server will be running at: `http://localhost:3000`

## Features

- will be added later

---

## 💡 Inspiration Only — Not for Use

![License: No License](https://img.shields.io/badge/license-NO--LICENSE-red)

This project is **not licensed** for use, copying, or modification.

You are welcome to **view** the code and use it for **inspiration only**, but you are **not allowed** to:

- Copy any part of this code
- Use it in your own projects
- Share or distribute it

If you want to use any part of this project, please ask for **explicit permission**.

---

## Contact

Contact me at [lokeshkollepara3971@gmail.com](mailto:lokeshkollepara3971@gmail.com).

## Author

**[Lokesh Kollepara](https://www.linkedin.com/in/kollepara-bapiraju/)**
