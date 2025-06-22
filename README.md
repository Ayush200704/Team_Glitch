<div align="center">
  <img src="https://github.com/user-attachments/assets/f4054e0f-563c-4547-a29d-167201890113" alt="Logo" />
</div>


# Emotion-Aware Fire TV: Smart Recommendation & Social Co-Viewing Platform

## Problem Statement

Fire TV’s passive content aggregation leads to fragmented discovery and basic recommendations based only on viewing history, overlooking contextual signals like mood, time, and environment. This creates user friction, prolonged browsing, and frequent session drop-offs. 

The absence of native social viewing forces users to coordinate externally, missing the chance to position Fire TV as a connected entertainment hub. 

These gaps pose business risks—impacting ad revenue, partner retention, user value, and satisfaction—while leaving Fire TV exposed to AI-savvy competitors. A strategic shift is needed toward an AI-driven, emotionally intelligent platform with real-time, context-aware recommendations powered by mood inference, IoT signals, and calendar data. 

Integrating native social co-viewing with synchronized playback, real-time interaction, and AI-driven experiences

## Our Solution:

**Context Recognition**  - Fire TV detects time, mood, environment, and calendar events to instantly understand user intent and emotional state using multimodal data like voice, biometrics, and smart devices.

**Intelligent Curation** - Within seconds, 3–5 personalized content options are shown, backed by explainable context (“Relaxed evening routine,” “Quick watch before your next meeting”) using behavioral and contextual ML models.

**Seamless Social Integration** - One-click invites, synchronized playback, and live reactions make shared viewing easy and engaging—coordinated smoothly across networks and devices.

**Adaptive Engagement** - AI enhances viewing with optional, context-aware trivia, facts, or suggestions, adjusting delivery based on mid-scenes context.

## What Makes Us Unique

### 1. **Multi-Modal Emotion Intelligence**
Unlike traditional recommendation systems that rely solely on viewing history, our platform integrates **four distinct emotion detection systems**:

- **Voice Emotion Recognition**: Real-time analysis of speech patterns, tone, and vocal characteristics.
- **Smartwatch Biometrics**: Heart rate variability, skin temperature, and stress levels from wearable devices.
- **Smart Home Environment**: IoT sensors analyze lighting, temperature, sound levels, and ambient conditions.
- **Calendar Context**: Temporal awareness of schedule, free time, and daily patterns.

### 2. **Contextual Recommendation Engine**
Our AI doesn't just recommend movies—it understands **when** and **why** you want to watch them:

- **Mood-Movie Matching**: 1000+ movies tagged with emotional compatibility (happy, stressed, relaxed, energetic, etc.).
- **Time-Aware Suggestions**: Recommendations that fit your available time slots and energy levels.
- **Environmental Adaptation**: Content that matches your current lighting, noise levels, and room conditions.
- **Behavioral Learning**: Continuous improvement based on your viewing patterns and emotional responses.

### 3. **Revolutionary Social Co-Viewing**
Transform solitary streaming into a connected social experience:

- **Synchronized Playback**: Perfect timing across all participants' devices.
- **Real-Time Chat & Reactions**: Live emoji reactions and group discussions.
- **AI-Powered Scene Interactions**: Dynamic trivia, polls, and fun facts triggered at key moments.
- **Host-Controlled Sessions**: One person leads the experience while others follow seamlessly.
- **Live Engagement Analytics**: See how your group reacts to different scenes.

### 4. **Intelligent Scene Analysis**
Our AI doesn't just play movies—it makes them interactive:

- **Automatic Scene Detection**: AI identifies key moments and dialogue segments.
- **Dynamic Content Generation**: Real-time trivia questions, polls, and fun facts.
- **Contextual Engagement**: Interactions that relate directly to what's happening on screen.
- **Personalized Difficulty**: Questions adapt to the group's knowledge level.


## Success Metrics

| **Metric**                          | **Description / Target**                                                                 | **How It's Measured**                                                                                          |
|------------------------------------|------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| **Time-to-Value (TTV)**            | Minimize time from Fire TV activation to content playback                                | Timestamp delta between app launch and playback across cohorts; home-to-playback drop-off analysis           |
| **User Retention & Engagement**    | Improve user retention and reduce session abandonment                                    | User login/activity logs, segmented by feature usage and behavioral archetype                                |
| **Feature Adoption**              | Encourage active users to explore new AI-driven features                                 | Feature flag instrumentation, usage event logs, time-bound funnel analytics                                  |
| **Social Engagement**              | Boost co-viewing frequency and enhance shared experiences                                | Session logs: invites, participants, interactions, durations; playback sync stability monitoring             |
| **Customer Satisfaction (NPS)**    | Increase user satisfaction and platform recommendation likelihood                        | In-app micro-surveys, post-session feedback, survey API data segmented by feature usage & context            |
| **Business Value & Churn Impact**  | Grow OTT content engagement and reduce user churn                                        | Analytics on watch time, completion rate, scroll depth per OTT; churn via login trends & retention data      |
| **User ‘Aha!’ Moments**            | Capture key user experience highlights to guide product improvements                     | Sentiment analysis & tagging from in-app feedback forms                                                       |
| **Delivery Velocity**              | Maintain predictable, timely feature delivery through agile practices                    | Agile metrics: story throughput, epic burndown, release readiness, deviation from planned delivery           |


## Key Features

### Real-Time Context-Aware Recommendations

- **Multi-source Emotion Detection**  
  Leverages voice tone, smartwatch data, ambient environment signals, and calendar events to infer emotional state in real time.

- **Mood-Movie Compatibility Scoring**  
  Matches user moods like `happy`, `relaxed`, `stressed`, `tired`, `sad`, `energetic`, `neutral`, `disgust`, `fear`, `angry`, and `pleasant_surprise` with optimal genres.  
  Uses advanced scoring mechanisms including:  
  - `popularity_score`  
  - `embedding_vector` based on language and genre similarity.  
  - `completion_rate` for session quality insights.  
  - `trending_now` to capture current interest spikes.

- **Time-Slot Optimization**  
  Recommends content that fits perfectly into available viewing windows using dynamic schedule awareness using calendar API.

- **Environmental Adaptation**  
  Adjusts recommendations based on lighting, sound, and room conditions provided by smarthome / IOT devices for a seamless viewing atmosphere.

- **Behavioral Pattern Learning**  
  Continuously refines suggestions by learning user preferences, habits, and feedback over time using `Random Forest Classifier` .

### Social Co-Viewing Infrastructure
- **WebSocket-based synchronization** for sub-second timing accuracy
  - Real-time video state synchronization using Socket.IO.
  - Automatic playback control propagation across all connected clients.
  - Seamless seek and rate change synchronization.
  - Host authority system for centralized control.

- **Host-controlled sessions** with participant management
  - Room-based architecture with unique session IDs.
  - Participant join/leave handling with real-time user list updates.

- **Live chat with emoji reactions** and real-time messaging
  - WebSocket-powered chat system with instant message delivery.
  - Emoji reaction system for quick emotional responses.
  - Message persistence within session duration.

- **AI-generated scene interactions** (trivia, polls, fun facts)
  - Automatic scene boundary detection using subtitle timestamps and pySceneDetect.
  - Dynamic content generation using LLM APIs (Groq API cloud).
  - Contextual trivia questions based on scene dialogue.
  - Interactive fun facts triggered at key narrative moments.

- **Cross-platform compatibility** (web)
  - Responsive React frontend with Tailwind CSS.
  - WebSocket client implementation for real-time features.
  - Video.js integration for synchronized playback.

### Advanced AI Integration
- **Speech emotion recognition** using deep learning models.
- **Smart home IoT integration** with mood prediction.
- **Calendar API integration** for temporal awareness.
- **Scene boundary detection** with subtitle analysis.
- **Dynamic content generation** using LLM APIs.

## Technical Architecture

### Backend Stack
- **FastAPI** for high-performance API endpoints.
- **WebSocket** for real-time communication.
- **Machine Learning** models for emotion detection.
- **IoT Integration** for smart home data processing.
- **Calendar APIs** for temporal context.

### Frontend Stack
- **React** with modern hooks and state management.
- **Tailwind CSS** for responsive, beautiful UI.
- **Socket.io** for real-time features.
- **Video.js** for synchronized playback.
- **Real-time mood visualization**.

### AI/ML Components
- **Smart Home Mood Prediction**: IoT sensor data analysis.
- **Smartwatch Biometrics**: Health data interpretation.
- **Scene Analysis**: LLM for content generation.
- **Recommendation Engine**
- **Random Forest Classifier**

## Impact & Results

### User Experience Improvements
- **Reduction** in content discovery time.
- **Increase** in user engagement through social features.
- **Accuracy** in mood-based recommendations.
- **Real-time synchronization** 

### Technical Achievements
- **Multi-modal emotion detection** with 4 distinct data sources.
- **1000+ movies** tagged with emotional compatibility.
- **Real-time scene interactions** generated by AI.
- **Cross-platform synchronization** across devices.
- **IoT integration** with smart home ecosystems.

## Demo 

[![Watch the video](https://github.com/user-attachments/assets/8caf0238-18c1-457d-b930-a7d405705f46)](https://youtu.be/BxTd25wGRxY)

## 🔮 Future Roadmap

### Phase 2: Enhanced Social Features
- **Virtual watch parties** with friends and family.
- **AI-powered conversation starters** based on movie content.
- **Group mood analysis** and collective recommendations.
- **Social media integration** for sharing experiences.
- **Privacy compliant data management**

### Phase 3: Advanced AI
- **Predictive mood modeling** based on daily patterns.
- **Content creation** of personalized movie trailers.
- **Voice-controlled interactions** with natural language processing.
- **Emotional storytelling** that adapts to viewer reactions.

### Phase 4: Ecosystem Expansion
- **Smart home automation** triggered by movie moods.
- **Wearable device integration** for health-conscious viewing.
- **AR/VR experiences** for immersive co-viewing.
- **Content creator tools** for interactive storytelling.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn package manager

### Backend Setup

1. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Node.js Dependencies**
   ```bash
   npm install
   ```

3. **Start the Backend Server**
   ```bash
   py -m uvicorn backend.main:app --reload
   npm run dev (in a new terminal)
   ```
   The python backend will be available at `http://localhost:8000`

   The node backend will be available at `http://localhost:3001`

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

### Complete Setup Commands
```bash
# Backend setup
pip install -r requirements.txt
npm install
py -m uvicorn backend.main:app --reload
npm run dev (in a new terminal)

# Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev
```

### API Documentation
Once the backend is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`


**Transform your Fire TV into an emotionally intelligent, socially connected entertainment companion that understands not just what you watch, but how you feel while watching it.**

