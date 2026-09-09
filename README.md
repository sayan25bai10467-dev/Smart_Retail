# 🛒 SmartRetail (SmartReatile): AI-Powered Campus Marketplace

> **Buy. Sell. Save. Inside Your Campus.**

SmartRetail is a localized e-commerce platform and price recommendation system designed exclusively for verified college students. Developed for VIT Bhopal University (Group 177 - Project Exhibition-I), the platform mitigates online scams and unfair pricing by creating a hyper-local, secure trading environment for temporary necessities like books, lab equipment, and cycles.

---

## ✨ Key Features

* **Integrated AI Chatbot:** Features an interactive "Ask AI" widget that provides users with instant price valuation assistance and platform guidance.
* **AI Smart Pricing Engine:** Powered by Python (Pandas and Scikit-learn), the platform calculates fair market depreciation based on item age, original retail price, and physical condition to ensure fair trades.
* **Frictionless Item Listing:** Easily list items with multiple photos and detailed inputs for category, condition, and negotiability.
* **Hyper-Local Filtering:** Connect with peers easily by filtering listings by Department, Semester, and specific Campus/Hostel Blocks (e.g., Block A, Main Gate).

---

## 🛠️ Technical Architecture

### Frontend (Client)
* **Languages:** HTML5, CSS3, JavaScript.
* **Purpose:** Delivers a mobile-friendly, responsive interface ensuring transparent pricing metrics and frictionless data entry.

### Backend (Server) & Database
* **Framework:** Python via FastAPI/Flask routing.
* **Database:** SQLite for relational data management.
* **AI/ML Integration:** Python libraries (Pandas, Scikit-learn) power the core recommendation engine logic.

### System Data Flow
1. **Frontend (Client)** initiates HTTP requests transferring JSON data.
2. **API Connection** securely routes this data to the server.
3. **Backend Server** processes inputs alongside the SQLite Database and AI Price Engine to calculate fair values and manage listings.

---

## 👨‍💻 Team & Contributions

* **Sayan Manna (25BAI10467):** Frontend Development & API Integration (HTML/CSS/JS).
* **Chirag Patil (25BAI10151):** Backend Development & AI Price Prediction Architecture (Python).
* **Tejaswi Kumar (25BAI10736):** UI/UX Design, Database Design.
* **Suraj Bisoyi (25BAI11007):** UI/UX Design, Database Design.
* **Prashant Patil (25BAI10809):** Presentation Design, Visual Assets & Pitch Structure.
* **Piyush Patil (25BAI10820):** Project Management, Documentation & System Architecture Mapping.

---

## 🛠️ Development & Deployment

* **Software Tools:** VS Code, Git/GitHub, Canva (UI Mockups).
* **Hardware Requirements:** Minimum 4GB RAM workstation (Windows/macOS) for development, and a cloud-hosting capable server for deployment.
