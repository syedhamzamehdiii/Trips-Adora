🚀 Frontend Setup
1. Navigate to frontend directory
bashcd frontend
2. Install dependencies
bashnpm install
3. Create environment file
bashcp .env.example .env
4. Start development server
bashnpm run dev
Frontend will run on: http://localhost:3000

🐍 Backend Setup
1. Navigate to backend directory
bashcd backend
2. Create virtual environment
bashpython -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
3. Install dependencies
bashpip install -r requirements.txt
4. Setup MongoDB

Install MongoDB locally or use MongoDB Atlas
Create a database named supplier_platform

5. Create environment file
bashcp .env.example .env
Edit .env and update:
envMONGODB_URL=mongodb://localhost:27017
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
6. Start development server
bashpython -m app.main
Or using uvicorn:
bashuvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Backend will run on: http://localhost:8000