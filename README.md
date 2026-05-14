# ✂️ Snipnote — AI-Powered PDF Summarizer  
👉 https://snipnote-v1.vercel.app  

![Docker](https://img.shields.io/badge/Dockerized-%231572B6.svg?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-%23339933.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%2347A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini%20AI-%234285F4.svg?style=for-the-badge&logo=google&logoColor=white)

---

**Snipnote** is an AI-powered PDF summarization platform designed to convert long, dense PDFs into **clean, slide-based summaries** for fast reading and better comprehension.  
It is built with a strong **product + system design mindset**, focusing on structured AI output, scalable backend logic, usage-based limits, and a polished frontend experience.

This project was built from scratch with an emphasis on **real-world SaaS architecture**, AI reliability, and user experience.

---

## 🚀 Features

- 📄 **AI PDF Summarization** — Convert PDFs into concise, slide-based summaries
- 🧠 **Structured AI Output** — Summaries are generated as structured JSON (slides with headings & points)
- 🎞️ **Slide-Style Summary Viewer** — Smooth, mobile-friendly slider UI with progress indicators
- 📊 **Word Count & Reading Metrics** — Backend-calculated word count from structured content
- 🪄 **Emoji-Enhanced Headings** — Improved readability and engagement
- 📁 **PDF Parsing & Validation** — Page count, file size, and text extraction checks
- 🔐 **Free vs Pro Limits** — Enforced limits on PDFs/month, pages, and file size
- 🐳 Dockerized Backend — Fully containerized Node.js backend for easy deployment
- 💳 **Subscription Ready** — Pro tier support with Razorpay integration
- 🧪 **AI Output Safety** — Defensive JSON extraction, validation, and retry logic
- 🚦 **Rate-Limit Friendly** — Designed to safely operate within Gemini free-tier constraints
- 📱 **Responsive UI** — Optimized for mobile, demo pages, and full-screen usage

---

## 🧱 Tech Stack

| Layer | Tech Used |
|------|-----------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, Shadcn UI |
| **Backend** | Node.js (Express), MongoDB (Mongoose), TypeScript |
| **AI** | Google Gemini  |
| **PDF Processing** | pdf-parse (native text extraction), validation pipeline |
| **Auth** | JWT-based authentication |
| **Payments** | Razorpay Subscriptions |
| **UI/UX** | Slide-based summary viewer, responsive layout |
| **Deployment** | Vercel (Frontend), Node.js backend |

---

## 🧠 System Design & Architecture Highlights

- ⚙️ **Structured AI Pipeline**
  - Gemini is prompted to return **strict JSON only**
  - Backend validates, sanitizes, and retries invalid AI responses
  - Prevents token waste and broken summaries
    
-  📦 **Dockerized Environment
  - Separate containers for backend server and Redis.
  - Local development mirrors production setup.

- 📦 **Slide-Based Summary Model**
  - Each summary is stored as structured slides:
    - `heading`
    - `points[]`
    - `idx`
  - Enables rich UI rendering and analytics

- 🔐 **Free & Pro Usage Enforcement**
  - Free tier: limited PDFs/month, page count, file size
  - Pro tier: significantly higher limits with reduced friction
  - All limits enforced at backend level

- 📄 **PDF Safety Pipeline**
  - File size validation
  - Page count validation
  - Text extraction check

- 🧠 **Backend-Derived Metrics**
  - Word count calculated from structured slides
  - Reading time & analytics ready
  - No AI dependency for metrics


- 🚦 **AI Failure Handling**
  - JSON extraction from noisy AI output
  - Retry prompt for invalid responses
  - Graceful failure states (no crashes)

## 🛡️ Robust AI Infrastructure (Advanced)

SnipNote leverages a sophisticated AI orchestration layer designed for high reliability and document complexity:

- 🔄 **High-Availability Fallback Mechanism**
  - Implements a multi-stage fallback pipeline using **Gemini 2.5-flash** as the primary engine.
  - Automatically fails over to **Gemini 2.5-flash-lite** upon detecting `429 RESOURCE_EXHAUSTED` or `503 Service Unavailable` signals.
  - Ensures uninterrupted service during peak API traffic.

- 🧩 **Intelligent Chunking & Map-Reduce Pipeline**
  - Engineered to bypass context window limitations for large-scale documents.
  - **Hierarchical Processing**: Fragmatic semantic chunking breaks down long PDFs into manageable micro-segments, which are then compressed into dense technical notes before final synthesis into slides.
  - Supports processing of high-density documents up to **55 pages** while maintaining thematic coherence.

- 🏗️ **Global State Consistency & Transactional Recovery**
  - Features a robust **State-Safety Wrapper** that manages summary lifecycles (Processing → Completed/Failed).
  - Atomic database state transitions ensure that AI processing failures are caught globally, reverting UI states and providing precise error telemetry without manual intervention.

- 📏 **Strict 8-Point Slide Architecture**
  - Enforces a high-density information layout with exactly 8 points per slide.
  - AI is prompted with strict constraints to ensure summaries are comprehensive, data-rich, and visually consistent across all PDF types.


---


## 🧑‍💻 Author

> Built with ❤️ by **Ayush Mishra**  
> https://www.linkedin.com/in/ayush-mishra-659951293  

---

## 🏷️ License

This project is open-source and available under the **MIT License**.
