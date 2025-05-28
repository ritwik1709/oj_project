# Online Judge Platform

A modern online coding platform that allows users to solve programming problems, submit solutions, and get real-time feedback. Built with React, Node.js, and Docker for a scalable and maintainable architecture. Features an AI-powered feedback system to help users understand and fix their code.

## 🌟 Features

### User Features
- **User Authentication**
  - Secure login and registration system
  - JWT-based authentication
  - Protected routes for authenticated users

- **Problem Management**
  - Browse problems by difficulty (Easy, Medium, Hard)
  - Detailed problem descriptions
  - Sample test cases with input/output examples
  - Problem difficulty indicators

- **Code Editor**
  - Syntax-highlighted code editor
  - Support for multiple programming languages:
    - C++
    - Python
    - Java

- **Submission System**
  - Real-time code execution
  - Test case validation
  - Detailed feedback on submissions
  - Support for both "Run" and "Submit" modes
  - AI-powered feedback
    - Personalized feedback/hints if the user submission fails for any problem.

### Technical Features
- **Frontend**
  - Modern React.js application
  - Responsive design with Tailwind CSS
  - Dark/Light theme support
  - Real-time code execution feedback

- **Backend**
  - RESTful API architecture
  - Secure code execution environment
  - Docker containerization for code execution
  - Scalable submission handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Docker
- MongoDB

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-judge
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd oj-frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../oj-backend
   npm install
   ```

4. **Environment Setup**
   - Create `.env` files in both frontend and backend directories
   - Configure necessary environment variables (see Configuration section)

5. **Start the Development Servers**
   ```bash
   # Start backend server
   cd oj-backend
   npm run dev

   # Start frontend server
   cd oj-frontend
   npm run dev
   ```

## ⚙️ Configuration


### Backend Environment Variables
Create a `.env` file in the `oj-backend` directory:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ADMIN_SECRET_CODE=your_secret_code_for_admin
HF_API_TOKEN=hugging_face_api
```

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Docker for code execution
- Hugging face Inference API integration for intelligent feedback

## �� Security Features
- JWT-based authentication
- Secure code execution in Docker containers
- Input validation and sanitization
- Protected API endpoints

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Author
- Ritwik Sudhakar Tat

## 🙏 Acknowledgments
- Inspired by popular online coding platforms
- Powered by OpenAI for intelligent code analysis and feedback 