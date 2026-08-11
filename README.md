# Sneaky 🕵️‍♂️

A modern, sleek, and interactive application built to deliver a seamless user experience with performance, scalability, and clean architecture in mind.

LIVE: https://sneaky-4zjb.onrender.com/

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
- 🤝 Merchant partner links on product details and cart checkout groups
- ❤️ Wishlist management with single-item delete and clear-all support
- 🛒 Cart and wishlist API integration
- 🔔 In-app notifications for cart reminders
- 🕘 Recently viewed product shortcuts
- 🖼️ Service worker image caching for repeat product and empty-state assets
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
├── docs/                    # Feature documentation
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
- redux
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

Sneaky uses the backend for authentication, recommended products, wishlist/cart state, product analytics, merchant checkout data, and notifications.

Detailed docs:

- [Backend integration](docs/features/backend-integration.md)
- [Frontend API lifecycle](docs/features/api-lifecycle.md)

## 📸 Screenshots

<img width="500" height="500" alt="Screenshot 2026-06-04 at 7 58 35 PM" src="https://github.com/user-attachments/assets/336d0a8f-7583-495b-99bd-0ae851f013b4" />
<img width="500" height="500" alt="Screenshot 2026-06-04 at 7 58 43 PM" src="https://github.com/user-attachments/assets/76257019-c3a2-4b2f-a93e-7d8de637f489" />
<img width="500" height="500" alt="Screenshot 2026-06-04 at 8 01 11 PM" src="https://github.com/user-attachments/assets/5dd6073f-b81e-402f-b237-9581bebe99b9" />
<img width="500" height="500" alt="Screenshot 2026-06-04 at 8 01 30 PM" src="https://github.com/user-attachments/assets/9e7cb309-0c85-4795-b64a-059b4259af8b" />
<img width="500" height="500" alt="Screenshot 2026-06-04 at 8 03 07 PM" src="https://github.com/user-attachments/assets/99d4c509-5043-412b-b802-d663b5a49b91" />
<img width="364" height="659" alt="Screenshot 2026-06-04 at 8 02 15 PM" src="https://github.com/user-attachments/assets/63761929-4edf-420f-bbf7-eee6dc00b8fe" />


## Roadmap
 - Improve animations
 - Optimize mobile responsiveness
 - Docker support
 - Track anonymous session preferences for guest recommendations

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
