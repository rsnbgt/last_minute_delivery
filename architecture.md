# System Architecture & Design Document

![Architecture Diagram](C:/Users/rsnbg/.gemini/antigravity/brain/b1aaac6c-ee53-4930-b207-4206de650b94/architecture_diagram_1766865805664.png)

## 1. System Overview
The **Last-Mile Delivery Confirmation System** is a 3-Tier application designed to solve the "fake delivery" problem. It ensures that a shipment is only marked as "Delivered" when the agent is physically present with the customer and verifies a secure Time-Based One-Time Password (TOTP).

## 2. architectural Components

### A. Presentation Tier (Mobile App)
- **Technology**: React Native (Expo)
- **Styling**: Tailwind CSS (`twrnc`)
- **Key Responsibilities**:
    - **Agent Authentication**: Secure Login/Register screens.
    - **OTP Request**: Interaction to trigger backend email service.
    - **Delivery Verification**: Input interface for Shipment ID & OTP.
    - **History View**: Lists past successful deliveries by the logged-in agent.

### B. Application Tier (Backend API)
- **Technology**: Node.js & Express.js
- **Key Responsibilities**:
    - **API Routes**: RESTful endpoints for Auth (`/auth`) and Delivery (`/delivery`).
    - **Business Logic**: 
        - Validates Agent Credentials (Password Hashing).
        - Generates 4-digit OTPs with 2-minute expiry.
        - Interfaces with SMTP Server (Nodemailer) to send emails.
        - Enforces business rules (e.g., prevent double delivery).
    - **Security**: Sanitizes inputs and handles CORS.

### C. Data Tier (Database)
- **Technology**: MySQL 8.0
- **Key Responsibilities**:
    - **Persistence**: Stores `agents` (users) and `shipments` (orders).
    - **Schema Enforcements**: Unique constraints on Emails/Mobile/IDs.
    - **Audit Trail**: Records `delivered_at` timestamp and `delivered_by` agent name.

## 3. Data Flow Scenarios

### Scenario 1: Agent Registration & Login
1.  **Agent** enters Name, Email, Password.
2.  **App** sends `POST /api/auth/register`.
3.  **Backend** hashes password (bcrypt) -> inserts into `agents` table.
4.  **Agent** logs in -> Backend verifies hash -> Returns success.

### Scenario 2: Requesting OTP
1.  **Agent** enters `Shipment ID`.
2.  **App** sends `POST /api/delivery/request-otp`.
3.  **Backend**:
    - Generates 4-digit Code (e.g., `5921`).
    - Calculates Expiry (Now + 2 mins).
    - Updates `shipments` table.
    - Sends Email via Nodemailer to Customer.
4.  **Customer** receives Email "Your OTP is 5921".

### Scenario 3: Confirming Delivery
1.  **Agent** asks Customer for OTP.
2.  **Agent** inputs `5921` into App.
3.  **App** sends `POST /api/delivery/confirm`.
4.  **Backend**:
    - Fetches Shipment.
    - Checks: `OTP Match?` AND `Not Expired?` AND `Not Already Delivered?`
    - If logic passes: Updates status to `Delivered`.
5.  **Database** commits transaction.
6.  **App** shows "Success" animation.

## 4. Security Measures
- **Password Storage**: Passwords are never stored in plain text. We use hashing.
- **OTP Expiry**: OTPs are valid for only 2 minutes to prevent replay attacks.
- **Validation**: All inputs (Email, Mobile, ID) are validated on Server side.

## 5. Technology Stack Decisions
| Component | Choice | Reason |
| :--- | :--- | :--- |
| **Framework** | **React Native** | Cross-platform (iOS/Android) with single codebase. |
| **Styling** | **Tailwind CSS** | Rapid UI development and consistent design tokens. |
| **Backend** | **Node.js** | Non-blocking I/O ideal for real-time API requests. |
| **Database** | **MySQL** | ACID compliance ensures data integrity for order status. |

```mermaid
graph TD
    subgraph Presentation Tier [Mobile App (React Native)]
        A[Agent Input: Shipment ID & OTP] -->|HTTP POST| B[API Gateway/Backend]
        G[Display Success/Failure]
    end

    subgraph Application Tier [Backend Service (Node.js/Express)]
        B --> C{Validate Input?}
        C -->|Invalid| D[Return 400 Error]
        C -->|Valid| E[Query Database]
        E --> F{OTP Match & Status Check?}
        F -->|No Match/Already Delivered| H[Return 401/409 Error]
        F -->|Match| I[Update Status to Delivered]
        I --> J[Return 200 Success]
    end

    subgraph Data Tier [Database (MySQL)]
        E <-->|SELECT| K[(Shipments Table)]
        I -->|UPDATE| K
    end

    B -.->|Response| G
    D -.->|Response| G
    H -.->|Response| G
    J -.->|Response| G
```
