# 🚀 BharatSafar — Travel Explorer & Booking Platform

**BharatSafar** is a modern, feature-rich, full-stack travel booking application designed to showcase Incredible India's top travel destinations. It offers seamless booking, integrated payments, user authentication, wishlists, reviews, notifications, and a comprehensive admin management panel.

---

## 🛠️ Tech Stack

### **Frontend**
* **HTML5 & Vanilla CSS3** – Modern responsive design, customized HSL colors, dark mode support, and glassmorphic UI elements.
* **Vanilla JavaScript (ES6+)** – All client-side routing, modular UI state management, API integration, and event handlers.
* **jsPDF** – Dynamic client-side PDF ticket and invoice generation.
* **FontAwesome 6.0** – Rich vector icons.

### **Backend**
* **Node.js & Express.js** – REST API server supporting routing, controllers, input validation, and unified error handling.
* **MongoDB & Mongoose** – NoSQL database schemas for Users, Destinations, Bookings, Reviews, Notifications, and Contacts.
* **JWT (JSON Web Tokens)** – Secure token-based session management and route protection middleware.
* **Bcrypt.js** – Secure password hashing.
* **Nodemailer** – Automatic HTML email confirmations (with Ethereal sandbox test account fallback).
* **Razorpay Node SDK** – Online payment gateway integration (supporting real payment keys & sandbox simulator).

---

## ✨ Features

### **1. User & Authentication System**
* Register, Login, and Password Reset (authenticated via backend database).
* Persisted user sessions using JWT stored in `localStorage`.
* Password visibility toggle (`Show/Hide`) on all input fields.
* Automatic admin redirection upon session restore or successful login.
* "Remember Me" checkbox support for saving credentials safely.

### **2. Travel Destinations & Filtering**
* Real-time search by keyword (title, description, or country).
* Categorized navigation (Beach, Mountain, Heritage, Spiritual).
* Interactive Price Slider filter (automatically scales to max price dynamically).
* Sorting by Price (ascending/descending) and Star Ratings.
* Auto-fallback to offline mock destination data if backend server goes down.

### **3. Advanced Booking Engine**
* Form validation on the client and server side.
* Custom booking date picker with a strict 2-month date limit.
* Live price calculator dynamically adding package premiums (Basic, Premium, Luxury) and adult/kid rates.
* Options to pay online via UPI/Razorpay or request a callback (Cash on Delivery).
* Automatic ticket generation (Downloadable PDF invoice) once booking is confirmed.

### **4. Payments (Razorpay & Callback COD)**
* Online orders generated securely via backend and verified through HMAC-SHA256 signatures.
* Demo mode sandbox simulation that bypasses payments if API keys are missing to prevent checkout block.

### **5. Wishlist System**
* Syncs saved destinations directly to user accounts in MongoDB.
* Wishlist badges on Navbar and Dashboard with a smooth bounce micro-animation upon addition/removal.

### **6. Live Customer Dashboard**
* **My Bookings** – Shows booking logs, transaction statuses, and invoice download buttons.
* **Notification Center** – 15-second live polling interval for real-time confirmation alerts with new-notification toast badges.
* **Wishlist Tab** – Allows direct booking and removal of saved packages.

### **7. Review & Rating System**
* Submit star ratings (1-5 stars) and detailed comments.
* Calculates dynamic average star rating and total reviews dynamically on the homepage cards.

### **8. Comprehensive Admin Control Panel**
* **Stats Panel** – Shows analytics summary (Total bookings, Total revenue, Active users, Pending callbacks, Destinations count).
* **Booking Manager** – Action button to trigger call confirmations or mark callback bookings as Paid (updates status, sends email, dispatches notification).
* **Contact Submissions** – Read messages submitted via the homepage query form.
* **Destination CRUD** – Form to add new destinations (name, price, rating, desc, image, custom ID) or delete existing cards live.

---

## 📂 Project Structure

```text
DECODE-LAB/
├── PROJECT01/
│   ├── FRONTED/                  # Static Frontend Files
│   │   ├── images/               # Image assets
│   │   ├── index.html            # Core Single Page HTML structure
│   │   ├── style.css             # Vanilla CSS design tokens & animations
│   │   └── script.js             # Client JS (State, Auth, APIs, jsPDF)
│   │
│   └── travel-explorer/          # Node.js + Express Backend
│       ├── config/               # Database connectivity (db.js)
│       ├── controllers/          # Controllers (auth, bookings, destinations, reviews, notifications, payments, contact)
│       ├── data/                 # Seeding JSON data fallback (users, destinations)
│       ├── middleware/           # authMiddleware, errorHandler, input validator
│       ├── models/               # Mongoose Schemas (User, Destination, Booking, Review, Notification, Contact)
│       ├── routes/               # API Router files
│       ├── services/             # Nodemailer emailService.js
│       ├── .env                  # Port, MongoDB URI, JWT and Razorpay secret keys
│       ├── package.json          # Node scripts and dependencies
│       └── server.js             # Application entry point
└── README.md                     # Root project documentation
```

---

## 🚀 Setup & Installation

### **Prerequisites**
* [Node.js](https://nodejs.org/) installed locally.
* [MongoDB](https://www.mongodb.com/try/download/community) community server running locally on port `27017` (or MongoDB Atlas Cloud cluster URI).

### **1. Configure Backend**
1. Navigate to the backend directory:
   ```bash
   cd PROJECT01/travel-explorer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `PROJECT01/travel-explorer/` (if it does not exist) and configure the variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/travel-explorer
   JWT_SECRET=bharatsafar_super_secret_key

   # Razorpay Credentials (Optional, Demo Mode triggers automatically if left blank)
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret

   # SMTP Credentials for Email Notifications (Optional, Ethereal Sandbox triggers automatically)
   SMTP_HOST=smtp.yourmail.com
   SMTP_PORT=587
   SMTP_USER=your_user
   SMTP_PASS=your_password
   ```
4. Start the backend server:
   * **Development mode (restarts on file changes):**
     ```bash
     npm run dev
     ```
   * **Production mode:**
     ```bash
     npm start
     ```

### **2. Configure Frontend**
1. Open `PROJECT01/FRONTED/script.js` and verify the `API_BASE` variable:
   ```javascript
   const API_BASE = 'http://localhost:5000/api';
   ```
2. Open `PROJECT01/FRONTED/index.html` directly in your browser or run it using a local development server (like VS Code Live Server).

---

## 📡 Backend API Endpoints

### **Authentication (`/api/auth`)**
* `POST /api/auth/register` – Sign up new user.
* `POST /api/auth/login` – Login user (returns JWT token + user details).
* `POST /api/auth/reset-password` – Reset password.
* `GET /api/auth/me` – Retrieve profile data (Private).
* `PUT /api/auth/wishlist` – Toggle wishlisted destination ID (Private).

### **Destinations (`/api/destinations`)**
* `GET /api/destinations` – List all destinations (supports filter query `?search=`).
* `GET /api/destinations/:id` – Fetch single destination details.

### **Bookings (`/api/bookings`)**
* `POST /api/bookings` – Place booking.
* `GET /api/bookings` – Retrieve bookings list (Private).

### **Reviews (`/api/reviews`)**
* `GET /api/reviews/:destId` – Retrieve reviews & avg rating for a destination.
* `POST /api/reviews` – Submit a review (Private).

### **Live Notifications (`/api/notifications`)**
* `GET /api/notifications` – Fetch live notifications (Private).
* `PUT /api/notifications/:id/read` – Mark notification as read (Private).

### **Admin Endpoints (`/api/admin` - Admin Role Required)**
* `GET /api/admin/stats` – Fetch analytics summary.
* `GET /api/admin/contacts` – Read query form submissions.
* `PUT /api/admin/bookings/:id` – Update booking status and mark as paid.
* `POST /api/admin/destinations` – Add a new destination card.
* `DELETE /api/admin/destinations/:id` – Delete a destination.

---

## 🌐 Deployment Instructions

### **Database (MongoDB Atlas)**
Create a database on MongoDB Atlas, add user permissions, and copy the Connection String. Paste this connection URI in your backend service `.env` file under the key `MONGO_URI`.

### **Backend (Render.com)**
1. Connect GitHub and choose the `DECODE-LAB` repository.
2. Select **Root Directory** as `PROJECT01/travel-explorer`.
3. Set **Build Command** to `npm install` and **Start Command** to `node server.js`.
4. Add all `.env` environment variables in Render settings.
5. Copy the live API URL provided by Render.

### **Frontend (Netlify / Vercel)**
1. In `PROJECT01/FRONTED/script.js`, change `API_BASE` to `https://your-render-app-url.onrender.com/api`.
2. Commit and push the changes to GitHub.
3. Deploy the `PROJECT01/FRONTED/` folder on Netlify or Vercel as a static site.
