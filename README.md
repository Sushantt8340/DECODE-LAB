
# DECODE-LAB

This repository contains projects completed as part of the DecodeLabs Internship Program.

---

# Project 1: Bharat Safar — Explore India (Frontend)

A travel destination website built using HTML, CSS, and JavaScript that showcases popular tourist destinations across India.

## Features

* Responsive user interface
* Destination cards with images and descriptions
* Search and filtering functionality
* Modern travel-themed design
* Pure frontend implementation

## Tech Stack

* HTML5
* CSS3
* JavaScript

## Project Structure

```text
FRONTED/
├── images/
├── index.html
├── style.css
└── script.js
```

---

# Project 2: BharatSafar Travel API

A RESTful Travel Explorer and Booking Platform built using Node.js and Express.js.

The API allows users to explore destinations, view destination details, create bookings, and submit contact requests.

## Features

* Get all travel destinations
* Search destinations
* View destination details
* Create travel bookings
* Retrieve booking records
* Contact endpoint support
* JSON-based API responses
* Error handling middleware

## Tech Stack

* Node.js
* Express.js
* JavaScript
* REST API

## API Endpoints

### Destinations

| Method | Endpoint                       |
| ------ | ------------------------------ |
| GET    | /api/destinations              |
| GET    | /api/destinations?search=query |
| GET    | /api/destinations/:id          |

### Bookings

| Method | Endpoint      |
| ------ | ------------- |
| GET    | /api/bookings |
| POST   | /api/bookings |

### Contact

| Method | Endpoint     |
| ------ | ------------ |
| POST   | /api/contact |

## Sample Response

```json
{
  "success": true,
  "message": "Destinations retrieved successfully"
}
```

## Project Structure

```text
travel-api/
├── controllers/
├── middleware/
├── routes/
├── package.json
├── package-lock.json
└── server.js
```

## Installation & Setup

1. Navigate to the API directory

```bash
cd travel-api
```

2. Install dependencies

```bash
npm install
```

3. Start the server

```bash
npm start
```

4. Open in browser

```text
http://localhost:5000
```

---

# Repository Structure

```text
DECODE-LAB/
│
├── FRONTED/
│   ├── images/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── travel-api/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
└── README.md
```

---

## Author

Sushant Kumar

DecodeLabs Internship Projects
