# 💰 Expense Tracker — Full Stack

A full-stack **Income & Expense Management Application** built as an internship project at **PJ SOFTTECH Pvt. Ltd.**

The application provides multi-user expense tracking, installment-based payments, GST/TDS calculations, bank account management, transaction filtering, CSV export, and interactive financial analytics through a dashboard.

## 🌐 Live Demo & Repository

* 🚀 **Live Demo:** https://i-track-expense.netlify.app/
* 📂 **GitHub Repository:** https://github.com/VishalPatilDev/ExpenseTracker_FullStack

---

## ✨ Features

### 🔐 Authentication

* User registration and login
* User details:

  * Name
  * Email
  * Phone number
  * Password

### 📊 Dashboard

* Summary cards for:

  * Total Income
  * Total Expense
  * Savings / Loss
  * Pending Income
  * Pending Expense
* Time-based filtering:

  * Today
  * Last 7 Days
  * Last 30 Days
  * Last 365 Days
  * Total
* Income vs Expense vs Savings/Loss comparison chart
* Monthly income/expense trend chart
* Year-wise filtering
* Category-wise income and expense analysis
* Toggle between **Pie Chart** and **Bar Chart**
* Month/year-based analytics filtering

### 💳 Transactions

Create income and expense transactions with:

* User
* Date
* Category
* Particular
* Amount
* GST %
* TDS %
* Automatically calculated totals
* Payment method:

  * Cash
  * UPI
  * Bank Transfer
  * Cheque
  * Credit Card
* Linked bank account
* Payment type:

  * One Time
  * Installment
* Remarks

#### Transaction Management

* Search transactions
* Filter by:

  * Transaction type
  * Timeframe
  * Bill type
  * Category
  * Payment method
  * Payment status
  * User
* View totals for:

  * GST
  * TDS
  * Paid amount
  * Pending amount
  * Total expense
  * Total income
* Edit transactions
* Delete transactions
* Export transactions to CSV
* Quick filters for:

  * Paid Off
  * Partially Paid
  * Pending
* Check-mark transactions for quick status management

### 📅 Installment Management

Create custom installment schedules for expenses.

* Define number of installments
* Set individual installment amounts
* Set custom due dates
* Running validation to ensure scheduled amounts equal the total expense
* Track installment status:

  * Paid
  * Partial
  * Pending
* Record payments against individual installments
* Add payment dates
* Add payment remarks
* View complete payment history for each installment

### ⚙️ Settings

#### 👥 Users

* Add users
* Edit users
* Delete users

#### 🏷️ Categories

* Add income/expense categories
* Edit categories
* Delete categories

#### 🏦 Banks

Manage bank accounts with:

* Bank name
* Branch
* Account number
* IFSC
* Account type

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Chart/Graph Library
* HTML5
* CSS3
* JavaScript

### Backend

* Java
* Spring Boot
* Spring Data JPA
* Hibernate
* REST APIs

### Database

* MySQL

---

## 📁 Project Structure

```text
ExpenseTracker_FullStack/
│
├── expensetracker/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── ...
│   │       │       ├── controllers/
│   │       │       ├── services/
│   │       │       ├── repositories/
│   │       │       └── entities/
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
├── frontend_expensetracker/
│   └── expense-frontend/
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* **Java 17+**
* **Maven**
* **Node.js 18+**
* **npm**
* **MySQL Server**
* **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/VishalPatilDev/ExpenseTracker_FullStack.git
cd ExpenseTracker_FullStack
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd expensetracker
```

Create the MySQL database:

```sql
CREATE DATABASE pjsoftdb;
```

Configure the database in:

```text
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/expensetracker_db
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD

spring.jpa.hibernate.ddl-auto=update

server.port=8080
```

Run the Spring Boot backend:

```bash
mvn spring-boot:run
```

The backend will run at:

```text
http://localhost:8080
```

### 3. Frontend Setup

Open a new terminal and navigate to:

```bash
cd frontend_expensetracker/expense-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

> **Note:** Make sure the frontend API base URL/configuration points to the running Spring Boot backend, for example `http://localhost:8080`.

---

## 📸 Screenshots

<img width="1920" height="1080" alt="Screenshot (185)" src="https://github.com/user-attachments/assets/111b7625-5900-4890-a697-6ccf75514cf8" />
<img width="1920" height="1080" alt="Screenshot (186)" src="https://github.com/user-attachments/assets/2c9df452-ad99-41e3-abe5-fe44910872a7" />
<img width="1920" height="1080" alt="Screenshot (187)" src="https://github.com/user-attachments/assets/b24ce798-df03-4578-96b2-374d78ca4957" />
<img width="1920" height="1080" alt="Screenshot (188)" src="https://github.com/user-attachments/assets/0f4cf3c5-e719-459a-b3c9-037732911d6b" />


<img width="1920" height="1080" alt="Screenshot (188)" src="https://github.com/user-attachments/assets/8253b986-15ff-4486-a6c5-60263895cc36" />


## 🔐 Login

<img width="1920" height="1080" alt="Screenshot (175)" src="https://github.com/user-attachments/assets/5910eca6-d989-4769-9469-54963ac90197" />
<img width="1920" height="1080" alt="Screenshot (176)" src="https://github.com/user-attachments/assets/4cae301e-45a0-4039-8659-cdefa6f28073" />

## 📊 Dashboard

<img width="1920" height="1080" alt="Screenshot (177)" src="https://github.com/user-attachments/assets/66362210-26df-4f8d-82ee-69a588e43467" />
<img width="1920" height="1080" alt="Screenshot (178)" src="https://github.com/user-attachments/assets/eec9fef6-a231-46fb-abf6-649c815dc4c1" />
<img width="1920" height="1080" alt="Screenshot (179)" src="https://github.com/user-attachments/assets/759d95dc-e1d0-4d14-9c05-a1eef1fb63ee" />


## ➕ Add Transaction

<img width="1920" height="1080" alt="Screenshot (180)" src="https://github.com/user-attachments/assets/2da8127b-2d54-46a1-9eb7-c2d4ab8083b4" />
<img width="1920" height="1080" alt="Screenshot (181)" src="https://github.com/user-attachments/assets/31ba90dd-1b72-4757-924b-4068fd223921" />


## 💳 Transaction List

<img width="1920" height="1080" alt="Screenshot (183)" src="https://github.com/user-attachments/assets/e1ae6009-1ff8-4d7f-ba8e-9d609482ce5f" />


## 📅 Installment Schedule

<img width="1920" height="1080" alt="Screenshot (182)" src="https://github.com/user-attachments/assets/aa853fc5-0379-4211-9467-690e22d5fdfd" />
<img width="1920" height="1080" alt="Screenshot (184)" src="https://github.com/user-attachments/assets/38aa5590-e076-4fb0-b125-2d9a52b56f95" />
<img width="1920" height="1080" alt="Screenshot (185)" src="https://github.com/user-attachments/assets/15e09af5-2a85-442a-bb01-596da240aff1" />






## ⚙️ Settings

<img width="1920" height="1080" alt="Screenshot (186)" src="https://github.com/user-attachments/assets/8a24494a-2deb-46f4-837c-be8e882e8746" />
<img width="1920" height="1080" alt="Screenshot (187)" src="https://github.com/user-attachments/assets/3cf3a97f-d4a4-4e84-879b-579662d67935" />
<img width="1920" height="1080" alt="Screenshot (188)" src="https://github.com/user-attachments/assets/f5f414dd-27e6-4af6-857d-995c8f2012d4" />



---

## 🗺️ Roadmap

* [ ] Role-based access control (Admin vs User)
* [ ] Email/SMS reminders for pending installments
* [ ] Export reports as PDF
* [ ] Multi-currency support
* [ ] Advanced reporting and analytics
* [ ] Improved notification system

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Commit your changes

```bash
git commit -m "Add your feature"
```

5. Push to your branch

```bash
git push origin feature/your-feature
```

6. Open a Pull Request

---

## 📄 License

This project was developed as an internship project at **PJ SOFTTECH Pvt. Ltd.**

If this project is intended to be open source, consider adding an **MIT License** to the repository.

---

## 🙏 Acknowledgements

* **PJ SOFTTECH Pvt. Ltd.** — Internship opportunity and project guidance
* Spring Boot & Spring Data JPA
* React & Vite
* MySQL
* Open-source community

---

## 👨‍💻 Project Highlights

This project demonstrates practical experience in:

* Full-stack application development
* REST API development
* React frontend development
* Spring Boot backend development
* Database design and management
* CRUD operations
* Authentication
* Financial calculations
* Installment/payment management
* Data visualization
* Search and filtering
* CSV data export
* Frontend-backend integration

**Built with ❤️ as a full-stack internship project.**
