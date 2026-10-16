# React Professor Project: Educational Resource-Sharing Blog

## 1. Understand what you are building

Think of the application as a **resource-sharing blog for students**.

There are three main types of users:

### Administrator

The administrator manages who is allowed to upload resources.

For the simple version, the admin can:

- Create facilitator accounts.
- Give facilitators a username and password.
- Disable or delete facilitator accounts if needed.

### Facilitator

Facilitators upload educational resources.

They can:

- Log in.
- Select an existing topic.
- Upload a PDF or PowerPoint presentation.
- Give the resource a title.
- See resources they uploaded.
- Potentially delete their own resources.

### Student

Students are viewers, not content creators.

They can:

- Browse topics.
- Open a topic and see its resources.
- View or download PDFs and PowerPoint files.
- Like a resource.
- See the number of likes a resource has received.

That is the core of the application.

---

## 2. Think of it as a resource portal, not a traditional blog

Although the professor calls it a **Blog**, the application is closer to an **Educational Resource Portal**.

A traditional blog often has posts, comments, and authors. Your application is better organized around:

**Topics → Resources → Resource Details**

For example:

```text
Computer Networks
├── CN Unit 1 Notes.pdf
├── OSI Model Presentation.pptx
├── TCP-IP Notes.pdf
└── Routing Algorithms.pptx

Database Management
├── SQL Basics.pdf
├── Normalization.pptx
└── ER Diagram.pdf

Operating Systems
├── Process Management.pdf
└── Scheduling Algorithms.pptx
```

This structure directly supports the requirement that there can be any number of topics, and each topic can contain any number of resources.

---

## 3. Decide the minimum features first

Avoid adding unnecessary features such as comments, notifications, chat, or profile pictures until the required features work.

### Authentication

The login flow is:

```text
Login
  ↓
Identify the user's role
  ↓
Student / Facilitator / Admin
```

The assignment says that authorized facilitators receive their credentials from the administrator. Therefore, facilitators should probably **not register themselves publicly**. The admin creates their accounts.

---

## 4. Plan the pages

Before coding, sketch the pages you expect to need.

### Student side

**Login → Home/Topics → Topic Details → View or Download Resource**

The home page might show topics such as:

- React
- JavaScript
- Database Management Systems
- Computer Networks
- Operating Systems

A topic page might show resources like this:

```text
React

React Basics.pdf
Uploaded by: Rahul
Uploaded: 25 September 2026
Likes: 23
[View] [Download]

React Hooks.pptx
Uploaded by: Atul
Uploaded: 27 September 2026
Likes: 41
[View] [Download]
```

### Facilitator side

The facilitator dashboard should include:

- Upload Resource
- My Resources
- A list of resources they have uploaded

### Administrator side

The admin dashboard should include:

- Manage Facilitators
- Create Facilitator Account
- Disable or remove a facilitator
- Manage Topics

These are proposed pages, not necessarily separate routes for every item. Keep navigation as simple as possible.

---

## 5. Understand the resource data

The resource is the most important entity in the application.

A resource should contain information such as:

```text
Resource
├── ID
├── Title
├── File location
├── File type
├── Topic
├── Uploaded by
├── Upload date/time
└── Likes (or likes related to this resource)
```

For example:

```text
ID: R102
Title: React Hooks Introduction
File: react-hooks.pptx
Type: PPTX
Topic: React
Uploaded by: Atul
Uploaded at: 30 September 2026, 04:30 PM
Likes: 27
```

The database should store these details separately rather than relying on the filename alone.

---

## 6. Handle the filename naming convention

The assignment says:

> “The naming convention shows the information about the owner of the resource, the date and time at which the resource was uploaded.”

One reasonable interpretation is that the **stored filename** should contain the uploader and upload date/time.

For example:

```text
atul_20260930_1630_react-hooks.pptx
```

A naming pattern could be:

```text
<username>_<YYYYMMDD>_<HHMM>_<resource-name>.<extension>
```

Another example:

```text
rahul_20260930_1435_database-normalization.pdf
```

The parts mean:

- `rahul`: uploader's username
- `20260930`: upload date
- `1435`: upload time
- `database-normalization`: resource name
- `.pdf`: file format

**Important:** Do not rely only on the filename to store this information. The database should separately store `uploadedBy` and `uploadedAt`. The filename helps fulfil the naming-convention requirement.

Ask the professor whether the filename itself must include the username and timestamp, or whether showing the owner and timestamp as resource metadata is sufficient.

---

## 7. Understand the upload workflow

A facilitator upload should work roughly like this.

### Step 1: Log in

The facilitator enters their username and password.

### Step 2: Open the upload page

They select **Upload Resource** from the dashboard.

### Step 3: Fill in the resource details

The form could contain:

```text
Topic:          [ Select a topic ▼ ]
Resource title: [__________________]
Select file:    [ Choose file     ]

                [ Upload ]
```

### Step 4: The backend processes the upload

The backend should:

1. Confirm that the user is authenticated.
2. Confirm that the user has the facilitator role.
3. Validate the uploaded file.
4. Generate the required filename.
5. Store the file.
6. Save the resource's metadata in the database.
7. Associate the resource with the selected topic and facilitator.

The interface should then show a success or error message.

---

## 8. React alone is not enough for a real application

React is responsible for the **user interface**. If the application needs actual authentication, file uploads, likes, and persistent data, it also needs a backend and storage.

A simple architecture is:

```text
                 React Frontend
                       |
                   API requests
                       |
                    Backend
                   /       \
                  /         \
             Database     File Storage
```

The database stores users, topics, resource metadata, and likes. File storage holds the actual PDF and PowerPoint files.

For a college assignment, this can be implemented without making the architecture overly complicated.

---

## 9. Plan the database

Start with four main entities:

1. Users
2. Topics
3. Resources
4. Likes

### Users

Possible fields:

```text
User
----
id
username
passwordHash
role
```

Roles might be:

```text
ADMIN
FACILITATOR
STUDENT
```

Store password hashes, **not plaintext passwords**. For a small project, students could be created by the admin or use another simple account-provisioning method approved by the professor.

### Topics

Possible fields:

```text
Topic
-----
id
name
```

Example topics:

```text
1 → React
2 → JavaScript
3 → DBMS
4 → Computer Networks
```

### Resources

Possible fields:

```text
Resource
--------
id
title
storedFilename
fileType
fileLocation
topicId
uploadedBy
uploadedAt
```

Relationships:

- One topic can have many resources.
- One facilitator can upload many resources.
- Each resource belongs to one topic and has one uploader.

### Likes

Possible fields:

```text
Like
----
id
studentId
resourceId
createdAt
```

This records **which student liked which resource**.

---

## 10. Design likes correctly

A beginner might store only a `likes: 57` counter on each resource. That makes it difficult to stop the same student from liking the same resource repeatedly.

Instead, keep a record connecting a student to a resource.

For example:

```text
Student A → Resource 10
Student B → Resource 10
Student C → Resource 10
```

Resource 10 has three likes.

Add a database uniqueness rule for the pair `(studentId, resourceId)`. This prevents the same student from creating duplicate likes for the same resource.

The backend should enforce this rule; hiding or disabling a button in React alone is not sufficient.

---

## 11. Understand the relationships

Conceptually:

```text
USER ── uploads ──> RESOURCE ── belongs to ──> TOPIC

STUDENT ── likes ──> RESOURCE
```

If these relationships make sense to you, you have understood a major part of the application's data design.

---

## 12. What should students see?

Keep the student interface simple and easy to scan.

### Home page

```text
Student Resource Portal

Search resources...

Topics
[ React ]              [ JavaScript ]
[ DBMS ]               [ Operating Systems ]
[ Computer Networks ]
```

### Topic page

```text
React

------------------------------------------------
React Fundamentals.pdf

Uploaded by: Rahul
30 September 2026, 10:30 AM
Likes: 34

[View] [Download]
------------------------------------------------

React Hooks.pptx

Uploaded by: Atul
29 September 2026, 04:20 PM
Likes: 52

[View] [Download]
------------------------------------------------
```

Displaying the uploader and upload time is useful because students can identify who provided the resource and when it was uploaded.

---

## 13. Decide what “View” means

PDFs can usually be displayed directly in a browser. PowerPoint viewing is more complicated and may require an external viewer or conversion.

A simple first version could support:

- **PDF:** View in the browser and download.
- **PPT/PPTX:** Download, or open with a supported viewer if you implement one.

Do not promise that every file can be previewed inside the site until you have tested it.

Ask your professor whether both PDF and PowerPoint files must be previewed **inside the website**, or whether downloading PowerPoint files satisfies the viewing requirement.

---

## 14. Keep authentication and authorization separate

The login flow is:

```text
Login
  ↓
Backend verifies username and password
  ↓
Backend identifies the user's role
  ↓
React displays the appropriate interface
```

The interfaces differ by role.

### Student

- Browse topics
- View resources
- Download resources
- Like resources

### Facilitator

- Browse topics
- Upload resources
- View their uploaded resources
- Manage their own resources, if permitted

### Administrator

- Create facilitator accounts
- Disable facilitator accounts
- Manage topics

**Important security rule:** React can hide buttons that a user should not see, but that is only a user-interface decision. The backend must independently verify permissions on every protected operation. A user should not be able to upload a file simply by sending an API request manually.

---

## 15. Validate uploaded files

The assignment limits resources to PDF and PowerPoint files.

Likely allowed extensions:

```text
.pdf
.ppt
.pptx
```

Confirm with the professor whether `.pptx` is acceptable; it is the modern PowerPoint format, while `.ppt` is the older format.

Do not rely only on the filename extension. The backend should validate uploads, enforce a sensible file-size limit, and store files safely. Never execute uploaded files as code.

---

## 16. Decide who creates topics

The assignment does not explicitly state who is allowed to create topics.

A clean default is:

1. The admin creates and manages topics.
2. Facilitators select an existing topic during upload.
3. Students browse the topics.

This avoids duplicates such as:

```text
React
react
REACT
React JS
React.js
```

If the professor wants facilitators to create topics, you can adjust the design. But agree on the rule before implementing it.

---

## 17. Features to avoid initially

This is a college assignment, so focus on the requirements instead of building a full commercial platform.

Do not initially add:

- Comments
- Chat
- Notifications
- Student profiles
- Follow systems
- Five-star ratings
- Complex recommendation algorithms
- AI-generated summaries
- Email verification
- Password-reset emails
- Social login
- Real-time notifications
- Microservices
- Docker/Kubernetes infrastructure

These are not required by the assignment. You can consider extras only after the core application works.

---

## 18. Build in phases

Do not attempt to implement everything at once.

### Phase 1 — UI with mock data

Build the basic pages and navigation:

- Login
- Student home/topics
- Topic details
- Facilitator dashboard
- Upload resource form
- Admin dashboard

Use fake data at this stage. Focus on layout, navigation, and user experience.

### Phase 2 — Backend and database

Connect React to a backend API.

Start with:

- Users
- Topics
- Resources

Implement authentication and role-based permissions.

### Phase 3 — File uploads

Implement the flow:

```text
Facilitator selects a file
        ↓
Backend validates the upload
        ↓
Backend generates the filename
        ↓
File is stored
        ↓
Resource metadata is saved
```

Test valid and invalid file types, large files, and failed uploads.

### Phase 4 — Student resource browsing

Implement:

```text
Browse topics
    ↓
Open a topic
    ↓
See its resources
    ↓
View or download a resource
```

### Phase 5 — Likes

Let students like resources and display the like count. Make sure one student cannot like the same resource repeatedly.

### Phase 6 — Administrator features

Implement the ability to create facilitator accounts and manage topics. Test that students cannot access facilitator or admin operations.

### Phase 7 — Testing and polish

Test the whole application using different roles. Check empty topics, missing files, failed uploads, duplicate likes, and unauthorized requests.

---

## 19. Overall architecture

A suitable high-level architecture is:

```text
                  React Frontend
                        |
                        | API
                        |
                     Backend
                        |
             ┌──────────┴──────────┐
             |                     |
          Database             File Storage
             |                     |
     Users, Topics,         PDF and PPT/PPTX
     Resources, Likes            files
```

This is sufficient for the project. Keep the implementation straightforward and choose tools you can understand and explain to your professor.

---

## 20. Clarify these questions with the professor

There are three important ambiguities in the assignment.

### Question 1: Who creates topics?

A reasonable default is the admin, but confirm this.

### Question 2: What does “view” mean?

Is this acceptable?

```text
PDF  → Preview in browser + Download
PPT  → Download
```

Or must both file types be viewable inside the website?

### Question 3: What exactly does “naming convention” mean?

Does the **stored filename** have to include the uploader, date, and time? Or is it enough to show the uploader and timestamp as resource information?

Clarifying these points now may save you from reworking the application later.

---

## 21. Recommended scope

Keep the first version focused:

```text
                    RESOURCE BLOG
                          |
          ┌───────────────┼───────────────┐
          |               |               |
         ADMIN        FACILITATOR       STUDENT
          |               |               |
     Create accounts   Upload files    Browse topics
     Manage topics     Select topic    View resources
     Manage access     See own files   Download files
                                      Like resources
```

The four core data entities are:

```text
Users
Topics
Resources
Likes
```

That is enough to build a complete first version of the assignment.

## 22. What to do before writing code

Follow this order:

1. Draw the four entities and their relationships on paper.
2. Decide which pages each user role needs.
3. Decide the upload and download workflows.
4. Choose a simple frontend, backend, database, and file-storage setup.
5. Define the API operations.
6. Build the interface with mock data.
7. Connect the backend and implement the required features.
8. Test the application with student, facilitator, and admin accounts.

**My main recommendation:** do not begin by building React components before you understand the entities and their relationships. Once you have the data model, page structure, and workflows clear, the React implementation becomes much easier to reason about.

You can work through the design step by step without writing code yet, beginning with the data model and the simplest suitable tech stack.
