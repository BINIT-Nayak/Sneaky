# Sneaky 🕵️‍♂️

A modern, sleek, and interactive application built to deliver a seamless user experience with performance, scalability, and clean architecture in mind.

---

## 📌 Overview

**Sneaky** is a project designed with a focus on modern UI/UX, optimized performance, and scalable architecture. Whether you're exploring frontend interactions, backend integrations, or full-stack implementations, Sneaky aims to provide a clean and maintainable development experience.

This repository showcases practical development patterns, reusable components, and efficient project structuring.

---

## ✨ Features

- ⚡ Fast and responsive interface
- 🎨 Clean and modern UI design
- 📱 Fully responsive across devices
- 🔒 Secure and scalable architecture
- 🧩 Reusable component structure
- 🏠 Swipe-style home product feed
- 🧠 Recommended product ordering from the backend
- 🏷️ Product category badges on home cards
- ❤️ Wishlist management with single-item delete and clear-all support
- 🛒 Cart and wishlist API integration
- 🕘 Recently viewed product shortcuts
- 🚀 Optimized performance
- 🔧 Easy configuration and customization

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React 18
- 🟦 TypeScript
- 🔀 React Router DOM
- 🗂️ Redux Toolkit
- 🔄 React Redux
- 🎨 CSS / SCSS
- 🎯 React Icons

### Build & Development
- ⚡ Vite
- 📦 ES Modules
- 🔍 ESLint
- 🎨 Stylelint
- 🧹 TypeScript ESLint

### Testing
- 🧪 Jest
- 🧫 React Testing Library
- 👤 User Event Testing
- 🌐 JSDOM Environment
- 🔧 ts-jest

---

## 📂 Project Structure

```bash
Sneaky/
│
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images, icons, fonts
│   ├── components/          # Reusable UI components
│   ├── pages/               # Application pages/routes
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Redux store & slices
│   ├── services/            # API services
│   ├── styles/              # Global styles & SCSS
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
│
├── tests/                   # Unit & integration tests
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── .gitignore

```

## 🚀 Getting Started
Prerequisites

Make sure you have installed:

- Node.js (v18+ recommended)
- npm or yarn
- Git

▶️ Running the Project

Start the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

## 🔌 Backend Integration

The home feed loads products from:

```http
GET /api/products/recommended
```

This endpoint returns products already ranked by the Spring Boot recommendation service. The UI keeps rendering the normal `Product[]` shape, so the recommendation logic stays on the backend.

Wishlist actions use authenticated API calls:

```http
GET /api/wishlist
POST /api/wishlist
DELETE /api/wishlist/{productId}
DELETE /api/wishlist
```

`DELETE /api/wishlist` clears all wishlist items for the logged-in user.

Home dislike feedback is recorded for logged-in users through:

```http
POST /api/product-analytics/products/{productId}/pass
```

## 📸 Screenshots

Add project screenshots here.

## Roadmap
 - Improve animations
 - Optimize mobile responsiveness
 - Docker support
 - Track anonymous session preferences for guest recommendations

## 🐛 Issues

If you find a bug or want to request a feature, please reach out to me in linkedin: https://www.linkedin.com/in/binitnayak2002/

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
