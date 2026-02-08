project description

Hermes is an AI-powered content creation platform that helps you create engaging LinkedIn posts by learning from successful creators. The app analyzes high-performing content, gathers context about your business, and generates personalized posts tailored to your voice and industry.

Setup instructions

# Create a virtual environment (one-time)
  python3 -m venv venv
  source venv/bin/activate

  # Install dependencies
  pip install -r app/requirements.txt

  # Run the backend
  uvicorn app.main:app --reload

  Terminal 2 — Frontend (Next.js on port 3000)

  cd /Users/Pierre/Desktop/github/hacknation_bak/frontend

  # Install dependencies (one-time)
  npm install

  # Run the frontend
  npm run dev

  Once both are running:
  - Frontend: http://localhost:3000
  - Backend API: http://localhost:8000

Login user id: pierre.gabaix@gmail.com
Login password id: pierre.gabaix@gmail.com