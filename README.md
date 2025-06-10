# Platter App

## 🍽️ Smart Platter Management & Task Tracker with Pre-defined Templates

The Platter App is a specialized task management system meticulously designed to streamline the preparation and tracking of food platters. It introduces the efficiency of pre-defined platter templates, allowing managers to quickly schedule recurring platter tasks without redundant data entry. It provides a clear interface for managers to define and assign platter creation tasks, and for team members to track and update their progress. Featuring real-time push notifications, it ensures that all relevant parties stay informed about critical deadlines and status changes.

---

## ✨ Key Features

### For Managers:

- **Master Platter Templates:** Maintain a comprehensive library of pre-defined platters, each with detailed ingredients, assembly instructions, and descriptions. This "master list" eliminates repetitive data entry.
- **Effortless Scheduling:** Select platters from the master list to schedule them for a specific due date and time.
- **Customizable Orders:** Add specific notes, special requests, or modifications to individual scheduled platter orders.
- **Comprehensive Overview:** View all upcoming and past scheduled platter orders with their due dates, times, and current completion status.
- **Full Control:** Ability to create, modify, and delete both master platter templates and individual scheduled platter orders.

### For Team Members (Non-Managers):

- **View Assigned Platters:** See all scheduled platter orders they are responsible for, including details, instructions inherited from the template, and specific deadlines.
- **Update Status:** Mark scheduled platters as `complete` or `incomplete` as they progress through the preparation process.
- **Focus on Execution:** Streamlined interface to manage their assigned tasks without modification or creation privileges for templates or orders.

### General Features:

- **Real-time Push Notifications:** Receive timely alerts for newly assigned platters, upcoming deadlines, or when a platter's status changes.
- **Progressive Web App (PWA) Ready:** Installable on any device for quick access and a native-app-like experience.
- **Modern User Interface:** Built for clarity and ease of use with a responsive design.

---

## 🚀 Technologies Used

The Platter App leverages a powerful combination of modern web technologies to deliver its features:

- **Next.js:** A React framework for building fast, full-stack web applications. It provides server-side rendering (SSR), static site generation (SSG), and API routes, enabling a highly performant and scalable architecture.
  - **App Router:** Utilizes the latest App Router for simplified routing, data fetching, and nested layouts.
  - **Server Actions:** A new Next.js primitive that allows direct server-side data mutations from client components, simplifying data flow and enhancing security for role-based actions.
- **React:** The core JavaScript library for building user interfaces, enabling a component-based and reactive approach to UI development.
- **TypeScript:** A strongly typed superset of JavaScript that adds type safety, improving code quality, readability, and maintainability. It helps catch errors early in the development process.
- **Tailwind CSS:** A utility-first CSS framework that allows for rapid UI development by composing classes directly in your JSX, leading to highly customizable and efficient styling.
- **Prisma:** A next-generation ORM (Object-Relational Mapper) that makes database access easy and type-safe.
  - **Prisma Schema:** Defines the database models (e.g., `PlatterTemplate`, `PlatterOrder`, `PushSubscription`, and potentially `User`/`Role`) and relationships in a human-readable format.
  - **Prisma Migrate:** Manages database schema changes in a controlled and versioned manner.
  - **Prisma Client:** An auto-generated, type-safe query builder that enables seamless interaction with your database from your Node.js/TypeScript code.
- **PostgreSQL (via Supabase):** A powerful, open-source relational database system used for reliable data storage for platter details, user data, and push subscriptions.
  - **Supabase:** Provides a robust backend-as-a-service platform, offering hosted PostgreSQL databases, authentication, and other backend services. It simplifies database management and scaling.
- **Web Push API (`web-push` library):** Enables sending push notifications from your server to users' browsers/devices. It handles the complexities of the Web Push Protocol, VAPID key management, and encryption to deliver timely alerts.

---

## 🛠️ Getting Started

Follow these steps to set up and run the Platter App locally.

### Prerequisites

- Node.js (v18.x or later recommended)
- npm (or yarn/pnpm)
- A Supabase account with a new project created.

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/platter-app.git](https://github.com/your-username/platter-app.git) # Replace with your repo URL
cd platter-app
```
