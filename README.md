# Vehicle Loan Calculator Website 🚗🏍️🚚

A modern, responsive, client-side **Vehicle Loan & EMI Calculator** web application built using **HTML5, CSS3, Vanilla JavaScript, Bootstrap 5, Chart.js, and LocalStorage**. 

Designed as a comprehensive college Web Technology / Financial Computing project, it provides an intuitive banking-grade experience to calculate monthly vehicle loan EMIs, explore principal vs. interest visual breakdowns, inspect detailed amortization schedules, and track calculation histories.

---

## 📑 Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Mathematical EMI Formula & Logic](#mathematical-emi-formula--logic)
6. [How to Run the Project Locally](#how-to-run-the-project-locally)
7. [LocalStorage Demo Authentication & Security Disclaimer](#localstorage-demo-authentication--security-disclaimer)
8. [Testing & Verification Guide](#testing--verification-guide)
9. [Future Enhancements](#future-enhancements)

---

## 1. Project Overview

The **Vehicle Loan Calculator** helps auto buyers, students, and financial planners estimate monthly vehicle loan EMIs before visiting car or bike dealerships. 

Unlike basic calculators, this system incorporates:
- Categorized loan parameters for **Cars (Four-Wheelers)**, **Bikes (Two-Wheelers)**, and **Commercial / Other Vehicles**.
- Dynamic dual slider & text input synchronization with Indian Rupee (`₹`) formatting.
- Real-time interactive **Chart.js Doughnut Charts**.
- Complete **Loan Amortization Schedules** (Yearly & Monthly breakdown).
- Client-side mock user registration, login, and user-isolated calculation history.
- Zero server dependencies—runs offline and directly inside any modern web browser.

---

## 2. Key Features

### 🔐 Authentication & Session Flow
- **Demo Seed Account:** Pre-loaded with demo credentials (`demo@bankloan.com` / `Password@123`) and a "One-Click Demo Credentials" button for effortless examiner evaluation.
- **User Registration:** Validates full name, email format, password strength (Weak, Fair, Good, Strong meter), password matching confirmation, and terms of service agreement.
- **Show/Hide Password:** Visual toggle on all password inputs.
- **Remember Me:** Retains email in `localStorage` across browser restarts.
- **Demo Password Reset:** Built-in modal to reset passwords in LocalStorage.
- **Protected Pages:** Protects `history.html` from unauthenticated direct visits by automatically redirecting to `login.html?redirect=history.html`.

### 🧮 Interactive EMI Calculator
- **Vehicle Presets:** Instant configuration buttons for Car (8.75% p.a., 5 yrs), Bike (10.5% p.a., 3 yrs), and Commercial (11.25% p.a., 5 yrs).
- **Dual Range Sliders & Inputs:** Sliders and text fields are bidirectionally synchronized.
- **Quick Preset Chips:** One-click shortcuts for vehicle prices (₹1.5L, ₹5L, ₹8.5L, ₹15L, ₹25L, ₹50L), down payment percentages (0%, 10%, 20%, 30%, 50%), interest rates, and loan tenures.
- **Zero-Interest Support:** Handles promotional 0% interest schemes smoothly without division-by-zero errors.
- **Edge-Case Validation:** Prevents negative numbers, zero tenure, and down payments exceeding the total vehicle price.
- **Indian Numbering Format:** All currency amounts formatted using standard Indian conventions (e.g., `₹5,00,000`).

### 📊 Visual Analytics & Amortization
- **Chart.js Donut Chart:** Interactive visualization showing the proportion of Net Borrowed Principal versus Total Bank Interest.
- **Yearly & Monthly Amortization Table:** Full schedule showing beginning balance, principal paid, interest paid, and remaining balance per installment.
- **Printable Quote:** Print-optimized stylesheet (`@media print`) hides navigation elements and formats a clean loan estimate page.

### 📜 Calculation History (Isolated Per User)
- **User Separation:** History records are keyed by user email (`vlc_history_{email}`), preventing account data collision on the same browser.
- **Filter & Sort:** Filter records by vehicle type (Car, Bike, Commercial) and sort by newest, oldest, or highest/lowest EMI.
- **One-Click Recalculate:** Automatically re-opens the calculator with all previous parameters pre-filled.
- **Delete & Clear All:** Delete single calculations or clear the entire history with a confirmation modal.

---

## 3. Technology Stack

| Technology | Purpose | Implementation |
| :--- | :--- | :--- |
| **HTML5** | Semantic Document Structure | `<main>`, `<header>`, `<footer>`, `<aside>`, accessible form elements |
| **CSS3** | Modern Banking Styling & Animations | Custom CSS variables, gradients, card glassmorphism, responsive media queries, print styles |
| **Vanilla JavaScript (ES6+)** | Logic & Mathematical Computation | Modular scripts, event listeners, DOM manipulation, `Intl.NumberFormat('en-IN')` |
| **Bootstrap 5.3.3 (CDN)** | Grid & UI Framework | Responsive layout, modals, dropdowns, navigation togglers |
| **Bootstrap Icons 1.11.3 (CDN)** | Vehicle & UI Iconography | Crisp SVGs for cars, bikes, trucks, locks, calculators |
| **Chart.js 4.4.4 (CDN)** | Data Visualization | Doughnut chart for Principal vs Interest split |
| **HTML5 LocalStorage** | Data Persistence | Client-side user accounts, login session, and loan history records |

---

## 4. Folder Structure

```text
vehicle-loan-calculator/
├── index.html          # Homepage & Dashboard with recent calculations and vehicle cards
├── login.html          # Authentication page with demo autofill, password toggle & reset modal
├── register.html       # User registration page with live password strength & matching validation
├── calculator.html     # Interactive Vehicle Loan EMI Calculator with Chart.js and amortization
├── history.html        # Calculation history page with user isolation, filters, sorting & recalculation
├── about.html          # Documentation, mathematical formula derivations, solved examples & tech stack
├── css/
│   └── style.css       # Custom design system (Navy blue palette, responsive tables, custom sliders)
├── js/
│   ├── auth.js         # Authentication helpers, session verification, demo seed, password strength
│   ├── calculator.js   # Mathematical EMI algorithm, currency formatting, Chart.js donut chart
│   ├── history.js      # User-specific history management, filters, sorting, and deletion
│   └── main.js         # Navbar state, user avatar dropdown, toasts, and dashboard widgets
├── assets/
│   └── images/         # Project visual assets
└── README.md           # Project documentation and viva guide
```

---

## 5. Mathematical EMI Formula & Logic

### Standard Reducing Balance Formula
Vehicle loans are calculated using the standard **Equated Monthly Installment (EMI)** formula:

$$\text{EMI} = \frac{P \times r \times (1 + r)^n}{(1 + r)^n - 1}$$

Where:
- **$P$ = Loan Principal:** $\text{Vehicle On-Road Price} - \text{Down Payment}$
- **$r$ = Monthly Interest Rate:** $\frac{\text{Annual Interest Rate}}{12 \times 100}$
- **$n$ = Total Repayment Months:** $\text{Tenure in Years} \times 12$

### Zero-Interest Scheme Handling ($r = 0$)
When interest rate is $0\%$, the standard formula would result in indeterminate $\frac{0}{0}$. The calculator cleanly catches this condition:
$$\text{EMI} = \frac{P}{n}$$
$$\text{Total Interest} = 0$$

### Total Repayment & Interest Calculation
- $\text{Total Repayment Amount} = \text{EMI} \times n$
- $\text{Total Interest Payable} = \text{Total Repayment Amount} - P$
- $\text{Total Cost of Vehicle} = \text{Down Payment} + \text{Total Repayment Amount}$

---

## 6. How to Run the Project Locally

Because this project is built entirely with client-side **HTML5, CSS3, and JavaScript**, no complex installation or database setup is needed.

### Method 1: One-Click Launcher (Easiest for Windows)
Simply double-click the **`start_project.bat`** file located in the project root folder.
- It automatically launches your default web browser to `http://localhost:8085/index.html`.
- It starts the local Python server in the background.

### Method 2: Direct File Launch (No Server Needed)
1. Open the project folder in File Explorer.
2. Double-click **`index.html`** to open it directly in your web browser (`file:///...`). All calculations, Chart.js, and LocalStorage features work 100% offline.

### Method 3: Command Line (PowerShell / Command Prompt)
Navigate to the project folder and run:
```bash
python -m http.server 8085
```
Then visit **`http://localhost:8085/index.html`** in your browser.

### Method 4: VS Code Live Server
- Open the project folder in VS Code.
- Right-click `index.html` $\rightarrow$ Click **"Open with Live Server"**.

---

## 7. LocalStorage Demo Authentication & Security Disclaimer

> ⚠️ **IMPORTANT ACADEMIC VIVA DISCLAIMER**
> 
> In this classroom demonstration project, **HTML5 LocalStorage** is employed to simulate user registration, session retention, and user-isolated calculation history without introducing complex database servers or external APIs.
>
> **Why LocalStorage is NOT production-ready:**
> 1. **Client-Side Exposure:** Any data stored in LocalStorage is accessible via browser Developer Tools (`F12` $\rightarrow$ Application $\rightarrow$ Local Storage) or cross-site scripting (XSS).
> 2. **Plaintext Password Storage:** In this prototype, passwords are saved on the client machine.
> 
> **How a Real-World Production Banking Application Operates:**
> - Uses a backend API (e.g. Node.js/Express, Spring Boot, or Django).
> - Passwords are cryptographically hashed and salted using **bcrypt**, **Argon2**, or **PBKDF2** on the server before storage in a SQL/NoSQL database.
> - Authentication uses **HTTP-only, Secure, SameSite session cookies** or cryptographically signed **JWT tokens** transmitted strictly over **TLS 1.3 / HTTPS**.

---

## 8. Testing & Verification Guide

| Test Scenario | Steps to Verify | Expected Result |
| :--- | :--- | :--- |
| **Demo Login** | Open `login.html`, click *"One-Click Demo Credentials"*, click *"Sign In"*. | Form populates `demo@bankloan.com`, logs in, redirects to `index.html`, navbar displays avatar. |
| **Registration Validation** | Open `register.html`, enter invalid email or mismatched passwords. | Live error indicators show "Passwords do not match" or invalid format; registration is blocked. |
| **Password Strength Meter** | Type characters into the password field on `register.html`. | Progress bar dynamically changes color and width (Weak $\rightarrow$ Fair $\rightarrow$ Good $\rightarrow$ Strong). |
| **Normal Calculation** | In `calculator.html`, set Price = ₹8,50,000, DP = ₹1,70,000 (20%), Rate = 8.75%, Tenure = 5 Yrs. | Principal = ₹6,80,000, EMI = ₹14,034, Chart updates with ~80% Principal & ~20% Interest. |
| **Zero-Interest Calculation** | Move Interest Rate slider to `0%`. | Calculates without errors: EMI = Principal / Months, Total Interest = ₹0. |
| **Down Payment = Price** | Set Down Payment equal to Vehicle Price. | Principal = ₹0, EMI = ₹0, displays "No loan required (100% Down Payment)". |
| **Down Payment > Price** | Set Down Payment higher than Vehicle Price. | Error banner appears: *"Down payment cannot exceed the total vehicle price"*, calculation blocked. |
| **History Persistence** | Perform calculation, click *"Save to History"*, open `history.html`, refresh page. | Saved record displays in table with date, EMI, vehicle badge; persists after page refresh. |
| **User History Separation** | Log in as User A, save a calculation. Log out, register User B, check `history.html`. | User B sees an empty history state; User A's calculations remain private to User A. |
| **Protected Page Redirect** | Log out, attempt to open `history.html` directly in the URL bar. | Automatically redirects to `login.html?redirect=history.html`. |
| **Responsive Design** | Press `F12`, toggle Device Emulation (iPhone / iPad / Desktop). | Clean responsive columns, stackable sliders, mobile-friendly hamburger menu. |

---

## 9. Future Enhancements
- Export calculation and amortization schedules to downloadable PDF and Excel (`.xlsx`) files.
- Extra prepayments / prepayment simulator to see how paying ₹5,000 extra per month reduces overall tenure.
- Compare two loans side-by-side (e.g., Bank A 8.5% vs Bank B 9.0% with lower processing fees).
- Integration with live bank API interest rate feeds.

---

**Developed for College Web Technology Examination & Viva Evaluation.**  
*Demonstrates clean frontend coding standards, responsive design, financial computation, and client-side storage architecture.*
