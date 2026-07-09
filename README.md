# Car Rental Super Admin + Admin Panel

ReactJS + Tailwind CSS demo project for a car rental workflow.

## Features

- Super Admin login
- Admin/company registration
- Company document upload
- Super Admin company verification/rejection
- Admin dashboard
- Admin car upload and management
- User car rent request form
- Admin user document upload after office visit
- Admin approve/reject rental request
- Mark active rental as returned
- LocalStorage based demo data persistence
- Responsive Tailwind CSS UI

## Demo Logins

### Super Admin

```txt
Email: super@rental.com
Password: 123456
Role: Super Admin
```

### Admin

```txt
Email: admin@demo.com
Password: 123456
Role: Admin
```

## Run Project

```bash
npm install
npm run dev
```

Then open the Vite local URL in your browser.

## Build Project

```bash
npm run build
npm run preview
```

## Folder Structure

```txt
car-rental-admin-panel/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── README.md
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── components/
    │   ├── Badge.jsx
    │   ├── EmptyState.jsx
    │   ├── FilePreview.jsx
    │   ├── Layout.jsx
    │   └── StatCard.jsx
    ├── context/
    │   └── AppContext.jsx
    ├── data/
    │   └── mockData.js
    ├── pages/
    │   ├── AdminDashboard.jsx
    │   ├── CarManagement.jsx
    │   ├── CompanyProfile.jsx
    │   ├── CompanyVerification.jsx
    │   ├── Login.jsx
    │   ├── RentRequests.jsx
    │   ├── SuperAdminDashboard.jsx
    │   └── UserRequestForm.jsx
    └── utils/
        ├── status.js
        └── storage.js
```

## Workflow

1. Admin registers company and uploads documents.
2. Super Admin logs in and verifies/rejects company.
3. Verified Admin can upload cars and details.
4. User submits car rent request from public page.
5. User visits office and submits documents.
6. Admin uploads user documents and approves request.
7. Car status becomes booked; after return, Admin marks it returned.

## Important Note

This is a frontend-only demo using localStorage. For production you should add a backend API, real database, authentication, cloud file storage, server-side validation, role permissions, and audit logs.
