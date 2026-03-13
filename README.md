# IIM-K-Group7-Batch-08-Integrating-Artificial-Intelligence-into-Net-Promoter-Score-NPS-
This is part of our Capestone project by IIM-K Group7 / Batch 08 "AI in healthcare Management Programme" were we Integrating Artificial Intelligence into Net Promoter Score (NPS) Systems for Enhanced Customer Insight and Predictive Analytics

Team members

1	Dr Aby Alex	abyalex15@gmail.com
2	Mrs Sathya Anandakumar	sathyaganand@gmail.com
3	Gunjeet Sehrawat	gunjeetsehrawat@gmail.com
4	Dr Shalini M A	shalinijy18@gmail.com
5	Jahnavi Trehan	jahanviblp1306980@gmail.com



We created a prototype for this project to demonstrate the power of artificial intelligence that can be used to tackcle one of the most difficult issues in the healthcare sector

 Primary Deliverables: 
•	AI-NPS Implementation Roadmap: Comprehensive guide for healthcare organizations planning AI integration 
•	Technology Selection Framework: Decision-making tools for choosing appropriate AI technologies
•	 ROI Assessment Model: Financial modeling tools demonstrating AINPS investment returns
•	 Best Practices Guide: Evidence-based recommendations for successful implementation Change
•	 Management Framework: Organizational change strategies for AI adoption 
•	Performance Dashboard Templates: Real-time monitoring tools for NPS analytics 
•	Quantitative Outcomes: Improved response rates , Reduced feedback processing time ,Enhanced satisfaction prediction accuracy,Increased operational efficiency metrics, Measurable               improvements in patient experience scores 
•	Strategic Impact: Enhanced patient retention and loyalty through improved experience management Competitive advantage through superior patient feedback systems Improved staff satisfaction     through actionable quality insights
•	 Reduced operational costs through automated feedback processing Foundation for broader AI adoption in healthcare quality management 


1. Tech Stack Overview
Frontend: React, Recharts (for the pie and bar charts), standard CSS.
Backend & API: Node.js and Express.js.
Database: SQLite3 (local, lightweight nps_feedback.db).
Bot Integration: node-telegram-bot-api to talk to Telegram.
AI / NLP Engine: Google Generative AI (Gemini 2.5 Flash) via @google/generative-ai.


2. Data Flow Pipeline
Input: Patients chat with the Telegram Bot using either Text Messages, Voice Notes, or Explicit NPS Inline Buttons (0 to 10).
AI Processing:
Text goes straight to the Gemini AI API.
Voice Notes are downloaded, converted to Base64, and sent to Gemini as a multimodal prompt.
The AI acts dynamically to transcribe the voice, calculate the Sentiment/NPS Category, and generate a 1-sentence "Actionable Insight".
Storage: The structured data (Patient Name, Feedback, Score, Category, Insight) is securely recorded in the local SQLite database.
Dashboard: The React App polls the Express backend every 10 seconds. The backend calculates total aggregates (mathematical % for Promoters/Detractors to get the true NPS score) on-the-fly from the DB.
Visualization: The dashboard visualizes these stats using Recharts and enables actionable filtering for the hospital admins.
 3. Intercommunication Protocols
Patient ↔ Telegram Bot Server: Secure HTTPS.
Node Backend ↔ Telegram API: HTTPS Long Polling.
Backend ↔ Gemini AI API: RESTful API via HTTPS.
Frontend ↔ Backend Server: RESTful HTTP (GET/DELETE) over localhost (CORS enabled).
Backend ↔ Database: Local File System I/O via SQLite3 queries.
