# Freelance Portfolio & Client Management System
A public freelance portfolio website plus a private admin dashboard.
Stack: HTML, CSS, vanilla JavaScript, Node.js, Express, MongoDB, Mongoose, JWT, bcrypt.

## Setup (beginners)
1. **Install Node.js** (LTS) from https://nodejs.org
2. **Install MongoDB Community Server** from https://www.mongodb.com/try/download/community (keep "Install as a Service" ticked so it runs automatically).
3. **Open the project in VS Code**: File → Open Folder → choose `freelance-portfolio-client-management`.
4. **Open a terminal**: Terminal → New Terminal.
5. Run `npm install`
6. **Check `.env`**: `PORT=3000`, `MONGODB_URI=mongodb://127.0.0.1:27017/freelance_portfolio`, and change `JWT_SECRET` to your own long random text.
7. Run `npm start`
8. Open http://localhost:3000

If you see "MongoDB connection failed", MongoDB is not running. Start the MongoDB service and try again.

## How MongoDB works
MongoDB stores data as *documents* (like JSON objects) inside *collections* (like tables). Mongoose models in `models/` describe each document. The database `freelance_portfolio` and its collections are created automatically. On first start, sample services and projects are added. You can inspect data with MongoDB Compass.

## Using the app
- **Create the admin account**: go to `/signup.html` and register. **The first account registered becomes the admin**; later accounts are normal users and cannot open the admin dashboard.
- **Login**: `/login.html` → you are sent to `/admin/index.html`.
- **Add clients**: Admin → Clients → *Add Client*. Search and filter by status. Edit/delete with the row buttons. Client data is never shown publicly.
- **Add projects**: Admin → Projects → *Add Project*. Technologies are comma separated (e.g. `HTML, CSS, Node.js`). They appear on the public Projects page.
- **View messages**: Admin → Messages. Messages arrive from the Contact page. View, mark Read/Replied, or delete.
- **Add services**: Admin → Services → *Add Service*. Icon is a Font Awesome name such as `fa-code`; features are comma separated. They appear on the public Services page.
- **Resume**: put your file at `public/resume.pdf` for the Download Resume button.
- **Change personal details**: edit the placeholder text in `public/about.html` and `public/index.html`.

## API overview
`/api/auth` (register, login, me) · `/api/clients` · `/api/projects` · `/api/messages` · `/api/services`.
Admin CRUD routes need `Authorization: Bearer <token>`. Public: GET projects/services, POST messages.

## Roles (admin and user)
- Login sends **admin → `/admin/index.html`** and **user → `/user/index.html`**.
- Public registration always creates a `user`. Any `role` sent by the browser is ignored. Only the very first account in an empty database becomes `admin`.
- Admin APIs (`/api/clients`, writes to projects/services, `/api/messages` reads/updates/deletes) require a valid JWT **and** `role: "admin"`, otherwise they return 403.
- A user sees only their own data (`/api/user/projects`, `/api/user/messages`). Projects are matched by the **client email**: in Admin → Clients add a client with the same email as the user's account, then assign that client to the project.
- To promote an existing account to admin, run in `mongosh`:
  `use freelance_portfolio` then `db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })`
