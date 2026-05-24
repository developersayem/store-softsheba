# Softsheba Detailed Client Requirements

Based on the raw requirements provided, here is the structured and detailed breakdown of the features, separated by frontend and backend responsibilities.

## 1. Core E-Commerce & Product Catalog
- **Products Catalog:** Needs modification to fully support **Subscription-based products** alongside standard products.
- **UI Modifications:** Enhancements required for **Product Cards** and the **Home Page** layout.
- **Order Management:**
  - Order Notifications.
  - Comprehensive Order Management (requires workflow modifications).
  - Dedicated Refund System.
  - Revamped Checkout Form.

## 2. Customer Relationship Management (CRM)
- **General CRM System:** Requires significant modifications to handle advanced workflows.
- **Customer Profile / Panel:** Every customer entity must display:
  - Name, Email, Phone/WhatsApp, Country.
  - Purchase History & Total Spent.
  - Services Taken.
  - Custom Notes & Tags.
  - Activity Log & Support History.
- **Internal Integrations:**
  - License Management system.
  - Invoice generation and tracking.
  - Lead Management.
  - SMS & WhatsApp automated messaging.
- **Support & Communication:**
  - Support Mails integration.
  - Floating Contact button & **Tawk.to** live chat integration.

## 3. Payments, Pricing & Currency
- **Payment Gateways:** Integration with **bKash**, **Stripe**, and **Manual** payment processing.
- **Multi-Currency Support:**
  - Auto-currency detection based on user location/IP.
  - Manual currency switcher.
  - Support for both **Fixed** conversion rates and **Dynamic** (real-time) conversion rates.
- **Dynamic Pricing:** Ability to set specific or alternative prices for foreigners.

## 4. Automation & Workflows
- **Auto Invoice:** Automated PDF invoice generation upon purchase.
- **Auto Email:** Automated transactional and promotional emails.
- **Auto Onboarding:** Automated flow for welcoming and setting up new clients.
- **Auto License Delivery:** Instant delivery of software licenses for digital products.
- **Auto-Renewal Reminder:** Scheduled notifications for subscription products nearing expiration.

## 5. Admin Dashboard & Analytics
- **System Monitoring:** System logs and user activity monitor.
- **Staff Management:** Granular roles, permissions, and management for team members.
- **Analytics & Reporting Dashboard:**
  - Total Revenue & Sales mapped by Country.
  - Top Customers & Customer Lifetime Value (CLV).
  - Conversion Rates & Failed Payments tracking.
  - Product Performance metrics.
  - Revenue comparison: Service Revenue vs. Digital Product Revenue.

## 6. Marketing & Store Configuration
- **Marketing Suite:** Full suite of marketing tools (Promotions, SEO, email campaigns).
- **Store Settings & Customization:**
  - Global Account Settings.
  - Maintenance Mode toggle.
  - Customizable Footer Links.

## 7. Platform & UX requirements
- **Fully Responsive:** Flawless experience across desktop, tablet, and mobile.
- **PWA Support:** Progressive Web App capabilities (installable on mobile).
- **Mobile Dashboard:** A tailored admin dashboard experience for mobile devices.

---

## Technical Responsibility Breakdown

### Frontend (Next.js / React)
*What needs to be built in the UI:*
- **User Interface:** Redesigning Product Cards, Home Page, Customer Panel, and building the Mobile Dashboard.
- **PWA Setup:** Configuring the Web App Manifest and Service Workers for installability.
- **Client-side Logic:** 
  - Manual currency switcher state.
  - Checkout form validation and multi-step UI.
  - Integrating 3rd party scripts like `Tawk.to` and Floating contacts.
- **Data Visualization:** Rendering charts and graphs (e.g., using Recharts) for the Analytics Dashboard (Revenue, Sales by country, etc.).
- **Dynamic Pricing UI:** Ensuring the UI reacts correctly to the detected currency or foreigner status.

### Backend (Node.js / Express / Database)
*What needs to be built on the server:*
- **Database Architecture:** Updating schemas to support Subscriptions, multi-currency pricing arrays, and advanced Customer objects (tags, notes, logs).
- **Payment Processing:** Secure API integrations with Stripe and bKash, plus a verification flow for manual payments.
- **Automations (Cron Jobs / Background Tasks):**
  - Scheduled workers for Auto-renewal reminders.
  - Trigger-based workers for Auto-invoices, Auto-emails, and Auto-license delivery.
- **Geolocation & Currency Logic:** Middleware to detect user IP, determine their country (for "foreigner" pricing), and calculate dynamic currency conversions.
- **Analytics Engine:** Writing complex aggregation queries to calculate Conversion Rates, CLV, and compare Service vs. Digital revenue.
