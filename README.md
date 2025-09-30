# Multi-Tenant B2B CRM with Scalekit Authentication

A full-stack multi-tenant CRM application demonstrating enterprise authentication and organization-based data isolation using Scalekit, built with React, Node.js, Express, and Supabase.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Testing Multi-Tenancy](#testing-multi-tenancy)
- [Known Issues & Challenges](#known-issues--challenges)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

This project is a demonstration of a multi-tenant B2B CRM that implements:

- **Multiple Authentication Methods**: Social login (Google), Magic Link, and OTP
- **Organization-Based Multi-Tenancy**: Complete data isolation between organizations
- **Contact Management**: Full CRUD operations with role-based access control
- **User Invitations**: Admin users can invite members to their organization

Built for the Scalekit Offline Project assignment, this application showcases proper authentication flows and enterprise-grade multi-tenancy patterns.

---

## ✨ Features

### Core Features

- **Authentication (via Scalekit)**
  - Google OAuth social login
  - Passwordless Magic Link authentication
  - One-Time Password (OTP) authentication
  - Secure session management with JWT tokens
  
- **Multi-Tenant Contact Management**
  - Create, Read, Update, Delete (CRUD) contacts
  - Organization-scoped data isolation
  - Role-based access control (Admin/User)
  - Contacts include: First Name, Last Name, Email, Phone, Address

- **Organization Management**
  - Automatic organization creation based on email domain
  - Users can only access data from their organization
  - Admin portal for user management

### Bonus Features

- **User Invitations**
  - Admins can invite users to their organization
  - Email invitations sent via Scalekit
  - Invitation tracking and management

---

## 🛠 Tech Stack

**Frontend:**
- React 18
- React Router DOM v6
- Axios for API calls
- CSS3 for styling

**Backend:**
- Node.js v18+
- Express.js
- JWT for session management
- Scalekit SDK (@scalekit-sdk/node)

**Database:**
- Supabase (PostgreSQL)
- Row Level Security (RLS) policies

**Authentication:**
- Scalekit (SSO, Passwordless Auth, Organizations)

---

## 📁 Project Structure

```
multi-tenant-crm/
├── client/                    # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContactForm.js
│   │   │   ├── ContactList.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   └── UserManagement.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── scalekit.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── contacts.js
│   │   │   └── users.js
│   │   ├── services/
│   │   │   └── supabase.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── database/
│   ├── schema.sql             # Supabase table schemas
│   └── rls-policies.sql       # Row Level Security policies
│
└── README.md
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** v9 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Scalekit Account** ([Sign up](https://app.scalekit.com))
- **Supabase Account** ([Sign up](https://supabase.com))

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/multi-tenant-crm.git
cd multi-tenant-crm
```

### 2. Scalekit Setup

1. **Create a Scalekit account** at [app.scalekit.com](https://app.scalekit.com)

2. **Create a new environment** (Development/Test)

3. **Configure Authentication Methods:**
   - Go to **Settings → Authentication**
   - Enable **Google OAuth**
     - Add OAuth credentials from Google Cloud Console
   - Enable **Passwordless Authentication**
     - Turn on **Magic Link**
     - Turn on **OTP (One-Time Password)**
   
4. **Configure Redirect URIs:**
   - Add redirect URI: `http://localhost:3001/api/auth/callback`
   - Add magic link redirect: `http://localhost:3000/verify-magic-link`

5. **Get Your Credentials:**
   - Navigate to **Settings → API Keys**
   - Copy:
     - Environment URL (e.g., `https://yourenv-xyz.scalekit.dev`)
     - Client ID
     - Client Secret (keep this secure!)

### 3. Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Create Database Tables:**

Run the following SQL in your Supabase SQL Editor:

```sql
-- Organizations Table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  scalekit_org_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  scalekit_user_id VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitations Table
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Indexes for performance
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_invitations_org ON invitations(organization_id);
```

3. **Enable Row Level Security (RLS):**

```sql
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Contacts (Organization Isolation)
CREATE POLICY "Users can view contacts in their organization"
  ON contacts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create contacts in their organization"
  ON contacts FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update contacts in their organization"
  ON contacts FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete contacts in their organization"
  ON contacts FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );
```

4. **Get Your Credentials:**
   - Go to **Settings → API**
   - Copy:
     - Project URL
     - `anon` public key
     - `service_role` secret key (for server-side operations)

### 4. Environment Configuration

#### Server Environment Variables

Create `server/.env` file:

```bash
# Scalekit Configuration
SCALEKIT_ENVIRONMENT_URL=https://yourenv-xyz.scalekit.dev
SCALEKIT_CLIENT_ID=your_client_id_here
SCALEKIT_CLIENT_SECRET=your_client_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development
SERVER_URL=http://localhost:3001
CLIENT_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration
JWT_SECRET=your_super_secret_random_string_here_min_32_chars
```

#### Client Environment Variables

Create `client/.env` file:

```bash
REACT_APP_API_URL=http://localhost:3001/api
```

### 5. Install Dependencies

#### Install Server Dependencies

```bash
cd server
npm install
```

**Server packages:**
- express
- @scalekit-sdk/node
- @supabase/supabase-js
- jsonwebtoken
- cors
- dotenv
- body-parser

#### Install Client Dependencies

```bash
cd ../client
npm install
```

**Client packages:**
- react
- react-dom
- react-router-dom
- axios

---

## 🚀 Running the Application

### Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

**Expected console output:**
```
✓ Scalekit initialized successfully
✓ Supabase connected
Server running on port 3001
```

### Start the Frontend

In a new terminal:

```bash
cd client
npm start
```

The React app will open at `http://localhost:3000`

### Access the Application

1. Open your browser to `http://localhost:3000`
2. You'll see the login page with three authentication options:
   - **Google Login**
   - **Magic Link** (email-based)
   - **OTP** (one-time password)

---

## 🧪 Testing Multi-Tenancy

To properly test the multi-tenant functionality, follow these steps:

### Test Scenario 1: Different Organizations

1. **User A - Example Org**
   - Login with: `john@example.com` (via any auth method)
   - Create contacts:
     - Alice Johnson (example.com)
     - Bob Smith (example.com)

2. **Open Incognito Window**

3. **User B - Different Org**
   - Login with: `emily@somecompany.com`
   - Create contacts:
     - Carol White (somecompany.com)
     - David Brown (somecompany.com)

4. **Verify Data Isolation**
   - John should only see Alice and Bob
   - Emily should only see Carol and David
   - Neither user can see the other organization's contacts

### Test Scenario 2: Same Organization

1. **User A - Admin**
   - Login as: `admin@testorg.com`
   - Create some contacts
   - Invite another user: `user@testorg.com`

2. **User B - Regular User (New Window)**
   - Login as: `user@testorg.com`
   - Both users should see the same contacts
   - Regular user can create/edit contacts
   - Only admin can invite users

### Test Scenario 3: Authentication Methods

Test each authentication method works:

**Google OAuth:**
1. Click "Login with Google"
2. Select Google account
3. Authorize the app
4. Should redirect to dashboard

**Magic Link:**
1. Enter email address
2. Click "Send Magic Link"
3. Check email inbox
4. Click the link in email
5. Should automatically log you in

**OTP:**
1. Enter email address
2. Click "Send OTP"
3. Check email for 6-digit code
4. Enter code
5. Click "Verify OTP"
6. Should log you in

---

## ⚠️ Known Issues & Challenges

### Version Discrepancies & API Issues

Throughout development, we encountered several challenges related to API version differences and documentation inconsistencies:

#### 1. Scalekit SDK Method Naming Issues

**Problem:** The Scalekit SDK documentation shows different method names than what's actually available in the Node.js SDK.

**Example:**
```javascript
// Documentation shows:
scalekit.passwordless.createAuthRequest()

// But actual SDK has:
scalekit.passwordless.sendOtp()
scalekit.passwordless.sendMagicLink()
```

**Solution:** We had to inspect the actual SDK type definitions:
```bash
cd server
cat node_modules/@scalekit-sdk/node/dist/index.d.ts
```

#### 2. REST API vs SDK Differences

**Problem:** REST API endpoint structure differs from SDK method calls.

**REST API Format:**
```
POST /api/v1/email/send
Body: { email, template, expires_in, magiclink_auth_uri }
```

**SDK Format:**
```javascript
await scalekit.passwordless.sendMagicLink({
  email,
  redirectUrl,
  templateType: 'SIGNIN'
})
```

**Solution:** We standardized on using the SDK methods instead of direct REST calls for consistency.

#### 3. Authentication Verification Flow

**Problem:** Magic Link and OTP verification had inconsistent parameter requirements.

**Initial approach (failed):**
```javascript
// This didn't work
const result = await scalekit.verify({
  linkToken: token,
  authRequestId: authRequestId
})
```

**Working solution:**
```javascript
// Extract code from URL for magic links
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

// Verify with correct parameters
const result = await scalekit.authenticateWithCode({
  code: code,
  codeVerifier: stored_code_verifier
})
```

#### 4. Session Management Issues

**Problem:** Scalekit's built-in session cookies didn't persist across page reloads in certain configurations.

**Solution:** Implemented custom JWT-based session management:
```javascript
// Server creates JWT with organization context
const token = jwt.sign({
  userId: user.id,
  organizationId: user.organization_id,
  role: user.role
}, process.env.JWT_SECRET, { expiresIn: '24h' });

// Client stores and includes in requests
localStorage.setItem('token', token);
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

#### 5. Organization Creation Timing

**Problem:** Race condition when creating organizations and users simultaneously during first login.

**Error Message:**
```
ERROR: insert or update on table "users" violates foreign key constraint
```

**Solution:** Implemented proper transaction ordering:
```javascript
// 1. Check/create organization FIRST
const org = await findOrCreateOrganization(email);

// 2. THEN create user with org reference
const user = await createUser({
  email,
  organization_id: org.id
});
```

#### 6. Supabase RLS with JWT

**Problem:** Supabase RLS policies couldn't validate organization context from Scalekit tokens.

**Solution:** Created custom middleware to validate and inject organization context:
```javascript
// Middleware extracts org from our JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  req.user = {
    id: decoded.userId,
    organizationId: decoded.organizationId,
    role: decoded.role
  };
  
  next();
};
```

#### 7. Environment URL Configuration

**Problem:** Inconsistent environment URL formats caused connection failures.

**Failed attempts:**
```
https://personal-xyz.scalekit.dev/  # Trailing slash caused issues
personal-xyz.scalekit.dev           # Missing https://
```

**Correct format:**
```
SCALEKIT_ENVIRONMENT_URL=https://personal-xyz.scalekit.dev
```

### Current Limitations

1. **Email Deliverability:** Magic link and OTP emails may go to spam folders during development
2. **Google OAuth Setup:** Requires proper OAuth consent screen configuration in Google Cloud Console
3. **Session Duration:** JWT tokens expire after 24 hours (configurable)
4. **File Uploads:** Contact photos/attachments not implemented
5. **Real-time Updates:** Contact list doesn't auto-refresh when other users make changes

### Debugging Tips

If you encounter issues:

1. **Check Server Logs:**
```bash
# Server should show initialization messages
✓ Scalekit initialized successfully
✓ Supabase connected
```

2. **Verify Environment Variables:**
```bash
cd server
node -e "require('dotenv').config(); console.log(process.env.SCALEKIT_CLIENT_ID)"
```

3. **Test Scalekit Connection:**
```bash
curl http://localhost:3001/api/auth/debug/scalekit-methods
```

4. **Check Database Connection:**
```bash
# In Supabase Dashboard → SQL Editor
SELECT * FROM organizations;
SELECT * FROM users;
```

5. **Browser Console:**
- Open DevTools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for failed API calls

---

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/login/google`
Initiates Google OAuth flow
```json
Request: { "email": "user@example.com" }
Response: { "authUrl": "https://accounts.google.com/..." }
```

#### POST `/api/auth/login/magic-link`
Sends magic link to email
```json
Request: { "email": "user@example.com" }
Response: {
  "success": true,
  "authRequestId": "abc123...",
  "message": "Magic link sent"
}
```

#### POST `/api/auth/login/otp`
Sends OTP code to email
```json
Request: { "email": "user@example.com" }
Response: {
  "success": true,
  "authRequestId": "abc123...",
  "message": "OTP sent"
}
```

#### POST `/api/auth/verify/otp`
Verifies OTP code
```json
Request: {
  "code": "123456",
  "authRequestId": "abc123..."
}
Response: {
  "token": "jwt_token...",
  "user": { ... }
}
```

#### GET `/api/auth/callback`
OAuth callback handler (used by Scalekit)

#### GET `/api/auth/me`
Gets current user info (requires auth token)
```json
Response: {
  "id": "uuid",
  "email": "user@example.com",
  "organization_id": "uuid",
  "role": "admin"
}
```

#### POST `/api/auth/logout`
Logs out current user

---

### Contact Endpoints (All require authentication)

#### GET `/api/contacts`
Lists all contacts in user's organization
```json
Response: {
  "contacts": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St"
    }
  ]
}
```

#### POST `/api/contacts`
Creates a new contact
```json
Request: {
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "address": "456 Oak Ave"
}
Response: {
  "success": true,
  "contact": { ... }
}
```

#### PUT `/api/contacts/:id`
Updates existing contact
```json
Request: {
  "first_name": "Jane",
  "last_name": "Smith-Updated",
  "email": "jane.smith@example.com"
}
Response: {
  "success": true,
  "contact": { ... }
}
```

#### DELETE `/api/contacts/:id`
Deletes a contact
```json
Response: {
  "success": true,
  "message": "Contact deleted"
}
```

---

### User Management Endpoints (Admin only)

#### GET `/api/users/organization`
Lists all users in current organization
```json
Response: {
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "user",
      "first_name": "John",
      "last_name": "Doe"
    }
  ]
}
```

#### POST `/api/users/invite`
Invites a user to organization (Admin only)
```json
Request: {
  "email": "newuser@example.com",
  "role": "user"
}
Response: {
  "success": true,
  "message": "Invitation sent"
}
```

#### DELETE `/api/users/:id`
Removes user from organization (Admin only)

---

## 🚢 Deployment

### Deploying to Production

#### 1. Environment Setup

Update environment variables for production:

**Server `.env`:**
```bash
SCALEKIT_ENVIRONMENT_URL=https://yourenv.scalekit.com
SCALEKIT_CLIENT_ID=prod_client_id
SCALEKIT_CLIENT_SECRET=prod_secret

NODE_ENV=production
SERVER_URL=https://api.yourdomain.com
CLIENT_URL=https://yourdomain.com

SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod_service_role_key

JWT_SECRET=production_secret_min_32_chars_random
```

**Client `.env`:**
```bash
REACT_APP_API_URL=https://api.yourdomain.com/api
```

#### 2. Build Frontend

```bash
cd client
npm run build
```

#### 3. Deploy Options

**Option A: Vercel (Frontend) + Railway (Backend)**

Frontend (Vercel):
```bash
cd client
vercel deploy --prod
```

Backend (Railway):
```bash
cd server
railway up
```

**Option B: Heroku (Full Stack)**

```bash
# Add buildpacks
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set SCALEKIT_CLIENT_ID=your_id
heroku config:set SCALEKIT_CLIENT_SECRET=your_secret
# ... all other env vars

# Deploy
git push heroku main
```

**Option C: AWS (EC2 or Elastic Beanstalk)**

1. Create EC2 instance
2. Install Node.js and dependencies
3. Set up nginx reverse proxy
4. Configure SSL with Let's Encrypt
5. Set environment variables
6. Use PM2 for process management

#### 4. Update Scalekit Configuration

In Scalekit dashboard:
- Update redirect URIs to production URLs
- Add production domain to allowed origins
- Update environment URL references

#### 5. Database Migration

Run production migrations in Supabase:
```sql
-- Same schema as development
-- Update RLS policies if needed for production
```

---

## 📋 Creating GitHub Repository

### Step 1: Create `.env.example` Files

**server/.env.example:**
```bash
# Scalekit Configuration
SCALEKIT_ENVIRONMENT_URL=https://your-environment.scalekit.dev
SCALEKIT_CLIENT_ID=your_client_id_here
SCALEKIT_CLIENT_SECRET=your_client_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development
SERVER_URL=http://localhost:3001
CLIENT_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration
JWT_SECRET=generate_random_32_char_string_here
```

**client/.env.example:**
```bash
REACT_APP_API_URL=http://localhost:3001/api
```

### Step 2: Create `.gitignore`

Create `.gitignore` in root directory:
```
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development
.env.production
*/.env
*/.env.local

# Build outputs
client/build/
dist/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
```

### Step 3: Initialize Git Repository

```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Multi-tenant CRM with Scalekit"
```

### Step 4: Create GitHub Repository

1. **Go to GitHub:** [github.com/new](https://github.com/new)

2. **Repository Settings:**
   - Name: `multi-tenant-crm-scalekit`
   - Description: `Multi-tenant B2B CRM with Scalekit authentication (Google OAuth, Magic Link, OTP)`
   - Visibility: **Public**

3. **Push to GitHub:**
```bash
# Add remote
git remote add origin https://github.com/yourusername/multi-tenant-crm-scalekit.git

# Push code
git branch -M main
git push -u origin main
```

### Step 5: Repository Setup

Add these files to root of repository:

**LICENSE** (MIT License recommended)
```
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

**CONTRIBUTING.md** (optional)
```markdown
# Contributing

We welcome contributions! Please follow these guidelines...
```

### Step 6: Add Repository Topics

On GitHub repository page:
- Click "Add topics"
- Add: `scalekit`, `multi-tenant`, `authentication`, `crm`, `react`, `nodejs`, `supabase`

---

## 🎓 Assignment Requirements Checklist

This project fulfills all requirements from the Scalekit Offline Project specification:

### ✅ Core Features (Required)

- [x] **Authentication with Scalekit**
  - [x] Google OAuth integration
  - [x] Magic Link authentication
  - [x] OTP (One-Time Password) authentication
  - [x] Multi-tenant organization management
  
- [x] **Basic Dashboard**
  - [x] Contact list view (organization-specific)
  - [x] Create new contact
  - [x] Edit existing contact
  - [x] Delete contact
  - [x] Contact fields: First Name, Last Name, Phone, Email, Address

- [x] **Multi-tenancy Demonstration**
  - [x] Users belong to organizations
  - [x] Complete data isolation between organizations
  - [x] Email domain-based organization assignment
  - [x] Row Level Security implementation

### ✅ Bonus Features (Optional)

- [x] **User Invitations**
  - [x] Admins can invite users to organization
  - [x] Email invitations via Scalekit
  - [x] Invitation tracking

### ✅ Technical Guidelines

- [x] Uses Scalekit SDK for all auth flows
- [x] Proper session handling (login/logout)
- [x] Backend in Node.js/Express
- [x] Clear folder structure
- [x] Frontend in React

### ✅ Testing Scenarios

- [x] User can sign up/login with Google
- [x] User can sign up/login with magic link
- [x] User can sign up/login with OTP
- [x] User can logout
- [x] Multi-tenancy works (different orgs see different data)
- [x] Contact CRUD operations work
- [x] Admin can invite users

### ✅ Deliverables

- [x] GitHub repo with complete source code
- [x] Clear folder structure
- [x] `.env.example` files
- [x] Setup instructions in README
- [x] Demo flow documentation
- [x] Code correctness and organization
- [x] Clear error handling

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Hashirr Lukmahn** - [Hashirr's Repo](https://github.com/HashirrLukmahn)

---

## 🙏 Acknowledgments

- [Scalekit](https://scalekit.com) for the authentication platform
- [Supabase](https://supabase.com) for the database solution
- Scalekit team for the assignment specifications

---

## 📞 Support

If you have questions or issues:

1. Check the [Known Issues](#known-issues--challenges) section
2. Review [API Documentation](#api-documentation)
3. Open an issue on GitHub
4. Contact: hashirrlukmahn@outlook.com

---

**Built with ❤️ for the Scalekit Offline Project**

*Estimated Development Time: 6-8 hours*
*Completion Date: September 2025*
