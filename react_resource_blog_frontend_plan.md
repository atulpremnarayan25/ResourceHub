# Frontend Development Plan — Educational Resource Blog

## 1. Purpose of this plan

This document describes how to build the **frontend** of the educational resource-sharing blog using React. It focuses on page structure, navigation, components, UI states, data flow, and an implementation order.

The goal is to build the frontend in manageable stages, without mixing UI work with backend implementation too early.

### What the frontend must support

- Students can browse topics, find resources, view or download them, and like resources.
- Facilitators can sign in, browse topics, upload PDF/PPT/PPTX resources, and manage their own uploads.
- Administrators can sign in, manage topics, and create or disable facilitator accounts.
- Resources display their title, topic, uploader, upload date/time, file type, and like count.
- The interface communicates loading, empty, success, and error states clearly.

> **Important:** The frontend can guide users and hide controls they are not allowed to use, but permissions must also be enforced by the backend. Do not treat a hidden button as security.

---

## 2. Scope: build the required experience first

### Must-have frontend features

1. Login form.
2. Role-aware navigation for Student, Facilitator, and Admin.
3. Topic listing and topic detail pages.
4. Resource cards or rows with metadata.
5. Search resources or topics.
6. Resource view/download actions.
7. Like/unlike interaction and visible like count.
8. Facilitator upload form with file selection and validation feedback.
9. Facilitator's own resource list.
10. Admin screens for facilitator accounts and topics.
11. Responsive layout for desktop, tablet, and mobile.
12. Loading, empty, error, and success states.

### Defer until the core features work

- Comments, chat, notifications, profiles, social login, complex dashboards, animations, AI summaries, and recommendation algorithms.

Do not add these extras just to make the project look bigger. A reliable, clear interface is more valuable.

---

## 3. Recommended frontend stack

Choose tools you can explain and maintain. A reasonable setup for a React college project is:

| Concern | Recommendation | Why |
|---|---|---|
| UI framework | React | Required by the assignment |
| Language | JavaScript initially, or TypeScript if you are comfortable | Avoid learning too many things at once |
| Build tool | Vite | Simple React development setup |
| Routing | React Router | Separate pages and role-aware navigation |
| Styling | CSS Modules or plain CSS | Clear and easy to debug |
| API calls | `fetch` or Axios | Connect pages to backend endpoints |
| Forms | React state first; add a form library only if needed | Keep early implementation understandable |
| Icons | One consistent icon library, optional | Avoid mixing icon styles |
| Testing | React Testing Library + Vitest, optional but useful | Test important user interactions |

**Keep the stack small.** You do not need Redux, a large component framework, or a complex design system for the first version. Start with React's built-in state and add tools only when a real need appears.

### Suggested project structure

Organize by feature rather than putting every file in one folder.

```text
src/
├── app/
│   ├── App
│   ├── routes
│   └── route-guards
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── resources/
│   ├── topics/
│   └── common/
├── features/
│   ├── auth/
│   ├── topics/
│   ├── resources/
│   ├── likes/
│   ├── facilitator/
│   └── admin/
├── pages/
├── services/
├── hooks/
├── styles/
└── main
```

This is a suggested structure, not a rule. Avoid creating a separate abstraction for every tiny element.

---

## 4. Define the user journeys before designing pages

### Student journey

```text
Open site
   ↓
Sign in (if required by the course rules)
   ↓
Browse/search topics
   ↓
Open a topic
   ↓
Choose a resource
   ↓
View or download it
   ↓
Like or unlike it
```

### Facilitator journey

```text
Open site
   ↓
Sign in
   ↓
Open facilitator dashboard
   ↓
Choose Upload Resource
   ↓
Select topic + enter title + choose file
   ↓
Review validation feedback
   ↓
Upload
   ↓
See confirmation and resource in My Resources
```

### Administrator journey

```text
Sign in
   ↓
Open admin dashboard
   ├── Manage topics
   └── Manage facilitator accounts
          ↓
      Create / disable account
```

These journeys help determine which pages and navigation links are necessary.

---

## 5. Page and route plan

Use routes that make each page's purpose clear. The exact route names can change, but decide them early.

| Route | Access | Purpose |
|---|---|---|
| `/login` | Signed-out users | Sign in |
| `/topics` | Students, Facilitators, Admin | Browse topics |
| `/topics/:topicId` | Signed-in users | View a topic's resources |
| `/resources/:resourceId` | Signed-in users | Resource details and actions, if a separate detail page is needed |
| `/facilitator` | Facilitator | Dashboard and quick actions |
| `/facilitator/resources` | Facilitator | List own uploads |
| `/facilitator/resources/new` | Facilitator | Upload a resource |
| `/admin` | Admin | Admin overview |
| `/admin/topics` | Admin | Create and manage topics |
| `/admin/facilitators` | Admin | List and manage facilitator accounts |
| `/admin/facilitators/new` | Admin | Create facilitator account |
| `*` | Everyone | Not-found page |

A separate resource detail page is optional. If the assignment is small, a resource card with preview/download and like actions may be enough.

### Route access rules

- Signed-out users should be sent to login when authentication is required.
- Students should not see facilitator or admin pages.
- Facilitators should not see admin management pages.
- Admin pages should be restricted to admins.
- After login, route users to an appropriate landing page for their role.
- If a user lacks access, show a clear “Access denied” page or redirect appropriately.

These frontend guards improve usability; the backend must still validate every protected request.

---

## 6. Plan the shared layout

Create one consistent application shell rather than designing each page independently.

### Desktop layout

- Header with application name/logo.
- Main navigation.
- Current user/role menu and sign-out action.
- Main content area with consistent width and spacing.
- Footer only if it adds useful information.

### Mobile layout

- Compact header.
- Collapsible navigation or menu.
- Cards that stack vertically.
- Forms that fit the screen width.
- Buttons large enough to tap.
- Tables that become cards or scroll horizontally when necessary.

### Suggested visual direction

Use a clean academic/resource-library style:

- Neutral background.
- One primary accent color.
- Clear typography and heading hierarchy.
- Strong contrast for text and buttons.
- Consistent spacing and border radius.
- Avoid excessive gradients, animations, and decorative cards.

The content should be the focus. Students need to find the right resource quickly.

---

## 7. Design the pages in this order

### Page 1 — Login

**Purpose:** Let an authorized user sign in.

Elements:

- Username field.
- Password field.
- Show/hide password control, optional.
- Sign-in button.
- Inline validation messages.
- Loading state while signing in.
- General error for invalid credentials or a failed request.

Do not add public facilitator registration because the assignment says the administrator supplies facilitator credentials.

Frontend considerations:

- Do not store passwords in local storage.
- Clear the password field after a failed attempt if appropriate.
- Avoid revealing whether a particular username exists.
- Let the backend handle authentication and session/token creation.

**Acceptance criteria**

- Empty fields show understandable validation.
- Submitting valid credentials enters the application.
- Invalid credentials show a clear error.
- The submit button cannot be repeatedly triggered while the request is pending.

### Page 2 — Topics listing

**Purpose:** Let users find a subject area.

Elements:

- Page title: “Topics” or “Resource Library”.
- Search input.
- Topic cards or a simple list.
- Resource count per topic, if the API provides it.
- Empty state when there are no topics.
- Loading and error states.
- A “Manage Topics” action only for admins.

Each topic card can show:

- Topic name.
- Short description, if supported.
- Number of resources, if available.
- “Open Topic” action.

Do not invent descriptions or counts if the backend does not supply them.

**Acceptance criteria**

- Selecting a topic opens its detail page.
- Search filters the visible topics.
- Empty search results are explained.
- Admin-only controls are not shown to other roles.

### Page 3 — Topic details and resource list

**Purpose:** Show all resources associated with a topic.

Elements:

- Topic name and optional description.
- Search/filter within resources if useful.
- Resource cards or rows.
- Sort order, preferably newest first by default.
- Pagination only if the list becomes large.
- Empty state when the topic has no resources.

Each resource item should display:

- Resource title.
- File type (PDF, PPT, or PPTX).
- Uploader's display name or username.
- Upload date and time.
- Like count.
- View/download action.
- Like/unlike action for eligible students.

Example:

```text
React Hooks Introduction
PPTX · Uploaded by Atul · 30 Sep 2026, 4:30 PM
42 likes

[Open/Download] [Like]
```

The interface should distinguish the current user's like state, for example “Like” versus “Liked”. The backend must prevent duplicate likes.

**Acceptance criteria**

- Resource metadata is readable on desktop and mobile.
- The file action works for the resource.
- The like count updates after a successful response.
- A failed like request displays an error and does not falsely claim success.
- An empty topic displays a helpful message.

### Page 4 — Resource viewing/downloading

**Purpose:** Help students access the file.

Keep expectations realistic:

- PDFs can often be previewed in the browser.
- PPT/PPTX preview may require an external viewer or additional implementation.
- Download should work for both supported formats when the backend provides a valid file response or download URL.

For the first version, it is acceptable to provide a clear download action and a browser PDF preview. Confirm with the professor whether both formats must be previewed inside the site.

The interface should handle missing or inaccessible files gracefully, rather than showing a broken viewer without explanation.

### Page 5 — Facilitator dashboard

**Purpose:** Give facilitators a quick way to upload and manage their resources.

Elements:

- Welcome heading.
- “Upload Resource” primary action.
- “My Resources” list.
- Optional count of resources uploaded, if available.
- Status or error messages.

Keep this page practical rather than filling it with decorative statistics.

**Acceptance criteria**

- The upload action opens the upload form.
- The own-resources list contains only resources returned for the signed-in facilitator.
- Empty state explains how to upload the first resource.

### Page 6 — Upload resource

**Purpose:** Submit a new resource.

Form fields:

- Topic selector.
- Resource title.
- File picker.
- Selected filename and file size.
- Upload button.
- Cancel/back action.
- Inline validation and upload progress, if supported.

Rules to reflect in the UI:

- Allow `.pdf`, `.ppt`, and `.pptx` only if those formats are approved.
- Show a clear message for unsupported files.
- Set a maximum file size based on the backend's limit.
- Do not let the user submit while required fields are missing.
- Show upload progress if the upload implementation supports it.
- On success, show confirmation and navigate to the new resource or My Resources.

The backend should generate the final stored filename using the agreed convention, such as:

`username_YYYYMMDD_HHMM_resource-name.pdf`

Do not trust the client-provided filename or timestamp as authoritative. The backend should record the actual uploader and upload time.

**Acceptance criteria**

- A facilitator can select a topic and valid file.
- Unsupported file types are rejected with a useful message.
- Pending upload state is visible.
- Success and failure are clearly distinguished.
- Repeated clicks do not create accidental duplicate submissions.

### Page 7 — My Resources

**Purpose:** Let a facilitator inspect their own uploads.

Display:

- Resource title.
- Topic.
- File type.
- Upload date/time.
- Likes.
- Available actions, such as open/download or delete if permitted.

If delete is supported, use a confirmation step. Removing a resource can affect students who use it, so do not make destructive actions too easy to trigger.

**Acceptance criteria**

- The list shows only the signed-in facilitator's resources.
- Empty, loading, and error states are present.
- Any destructive action requires appropriate confirmation.

### Page 8 — Admin: Manage Topics

**Purpose:** Keep the topic list consistent.

Elements:

- List of existing topics.
- Create-topic form.
- Edit action if editing is in scope.
- Delete action only if the backend supports safe deletion.
- Validation for required names and duplicate topics.

Avoid creating duplicates with differences in capitalization or surrounding whitespace. The backend should enforce uniqueness too.

If topics with resources cannot be deleted, explain that in the UI.

### Page 9 — Admin: Manage Facilitators

**Purpose:** Create and manage authorized uploaders.

Elements:

- Facilitator list.
- Create facilitator form.
- Username and any required account details.
- Active/disabled status.
- Disable or reactivate action if supported.
- Clear success/error messages.

Do not show or retrieve existing passwords. If the admin sets an initial password, it should be handled securely and never displayed again in plaintext after creation.

**Acceptance criteria**

- Admin can create a facilitator account.
- Duplicate usernames show a clear error.
- Admin can see account status.
- Non-admin users cannot access the page or perform these actions.

### Page 10 — Not found and access denied

Create simple fallback pages:

- **Not found:** The requested page or resource does not exist.
- **Access denied:** The signed-in user does not have permission to access the page.

Provide a safe route back to Topics or the appropriate dashboard.

---

## 8. Build reusable components

Do not duplicate the same UI in every page. Build a small set of components that solve repeated problems.

### Layout and navigation

- `AppLayout`
- `Header`
- `Navigation`
- `UserMenu`
- `PageContainer`

### Topics and resources

- `TopicCard`
- `TopicList`
- `ResourceCard` or `ResourceRow`
- `ResourceList`
- `LikeButton`
- `FileTypeLabel`
- `UploadDate`
- `FileActions`

### Forms and feedback

- `TextField`
- `SelectField`
- `FilePicker`
- `Button`
- `LoadingIndicator`
- `ErrorMessage`
- `EmptyState`
- `SuccessMessage`
- `ConfirmDialog` (only if needed)

Build a component when it is reused or has meaningful behavior. Do not create components for every single wrapper element.

---

## 9. Plan frontend state and data flow

Keep state ownership understandable.

### Local component state

Use local state for short-lived UI details, such as:

- Search text.
- Selected file.
- Form field values.
- Whether a confirmation dialog is open.
- Current validation messages.

### Shared authentication state

The app needs to know:

- Whether a user is signed in.
- The user's identity and role.
- How sign-out works.

Use a small authentication context or another simple approach appropriate to the project. Do not introduce a large global-state library unless the app genuinely needs it.

### Server data

Topics, resources, likes, and facilitator accounts come from the backend. Keep API calls in a service/API layer rather than scattering request logic across visual components.

Possible service modules:

```text
services/
├── authService
├── topicService
├── resourceService
├── likeService
└── facilitatorService
```

The names are conceptual. Use whatever naming convention your project follows.

### Important rule

Do not make the frontend's mock data the permanent source of truth. During UI development, mock data is useful; after the backend is connected, the API should provide the real data.

---

## 10. Start with mock data, but define the API needs early

Build the layout using realistic sample data first. This lets you work on UI without waiting for the backend.

However, agree on the expected data shape with whoever builds the backend.

For example, the frontend will need operations conceptually equivalent to:

| Operation | Purpose |
|---|---|
| Sign in / sign out | Authentication |
| Get current user | Restore session and role |
| List topics | Populate topic page |
| Get topic resources | Populate topic details |
| Get resource details | Optional resource page |
| Get/download resource file | Open or download the file |
| Like/unlike resource | Update student feedback |
| List facilitator's resources | Populate My Resources |
| Upload resource | Submit file and metadata |
| Create/update/delete topic | Admin topic management |
| List/create/disable facilitator | Admin account management |

The actual endpoint names and request formats should be agreed with the backend implementation. Do not invent them independently and then assume they match.

---

## 11. Create consistent UI states

Every page that loads data should handle at least four states.

### Loading

Show a spinner, skeleton, or short loading message. Avoid leaving the page completely blank.

### Success

Show the requested data and make the main action obvious.

### Empty

Explain what is missing and, where appropriate, what the user can do next.

Examples:

- “No topics have been created yet.”
- “This topic has no resources yet.”
- “You haven't uploaded any resources.”

### Error

Explain that the request failed and offer retry where reasonable. Do not display raw backend stack traces.

Also plan for:

- Expired login/session.
- Network disconnection.
- Resource file no longer available.
- Unsupported upload.
- Duplicate topic or username.
- Failed like/unlike request.

---

## 12. Accessibility and responsive design

Include these from the beginning rather than treating them as optional polish.

- Use semantic headings and buttons.
- Associate form labels with their inputs.
- Ensure keyboard navigation works.
- Make focus indicators visible.
- Use sufficient text/background contrast.
- Do not communicate errors or file types using color alone.
- Provide meaningful text for icon-only buttons.
- Make controls comfortable to tap on mobile.
- Test long resource titles and filenames so they do not break layouts.
- Format dates consistently and display the time zone if ambiguity matters.

---

## 13. Frontend implementation roadmap

Work through the following milestones in order.

### Milestone 1 — Project setup and shell

- Create the React app.
- Configure routing.
- Establish global typography, colors, spacing, and layout.
- Build the header and navigation.
- Add placeholder pages for each route.
- Test desktop and mobile layout.

**Done when:** All routes load and navigation is understandable, even though data is still fake.

### Milestone 2 — Student browsing experience

- Build topic cards/list.
- Add search.
- Build topic detail page.
- Build resource cards/rows.
- Display uploader, timestamp, file type, and likes.
- Add placeholder view/download and like actions.

**Done when:** A student can navigate from Topics to a resource and understand its metadata.

### Milestone 3 — Login and role-aware UI

- Build login form and validation.
- Add shared authentication state.
- Add role-aware navigation.
- Add frontend route guards.
- Add sign-out behavior.

Use a mock authentication service only while developing the UI. Replace it with real backend authentication later.

**Done when:** Each test role sees the correct navigation and unauthorized pages are handled cleanly.

### Milestone 4 — Facilitator experience

- Build facilitator dashboard.
- Build upload form.
- Add file-type and file-size feedback.
- Build My Resources.
- Add upload pending, success, and error states.

**Done when:** The interface can complete the upload workflow with mock responses and is ready to connect to the API.

### Milestone 5 — Admin experience

- Build topic management.
- Build facilitator list.
- Build create-facilitator form.
- Add status and confirmation feedback.

**Done when:** Admin screens cover the required workflows with mock data.

### Milestone 6 — Connect the backend

- Replace mock services with real API calls.
- Integrate sign-in and session handling.
- Load topics and resources from the backend.
- Connect upload and download.
- Connect like/unlike.
- Connect admin operations.
- Handle API errors and expired sessions.

**Done when:** The frontend uses persistent backend data instead of local mock data.

### Milestone 7 — Testing and polish

- Test all roles.
- Test all routes.
- Test forms and validation.
- Test upload success/failure.
- Test duplicate likes.
- Test missing or deleted files.
- Test small screens and keyboard navigation.
- Fix visual inconsistencies and console errors.

**Done when:** Core workflows work end to end and failures are understandable to users.

---

## 14. Suggested testing checklist

### Student

- [ ] Can sign in and sign out.
- [ ] Can see available topics.
- [ ] Can search topics/resources if search is implemented.
- [ ] Can open a topic and see its resources.
- [ ] Can identify the uploader, timestamp, and file type.
- [ ] Can view/download an available file.
- [ ] Can like and unlike a resource if permitted.
- [ ] Cannot access facilitator/admin operations.

### Facilitator

- [ ] Can sign in.
- [ ] Can see the facilitator dashboard.
- [ ] Can select an existing topic.
- [ ] Can upload an approved file type.
- [ ] Sees validation for unsupported file types and oversized files.
- [ ] Sees upload progress or pending feedback.
- [ ] Sees success or failure feedback.
- [ ] Can see their own uploaded resources.
- [ ] Cannot access admin-only operations.

### Administrator

- [ ] Can sign in.
- [ ] Can create and manage topics.
- [ ] Can create facilitator accounts.
- [ ] Can see facilitator account status.
- [ ] Can disable/reactivate accounts if supported.
- [ ] Cannot accidentally expose plaintext passwords.
- [ ] Non-admin users cannot access admin pages.

### General

- [ ] Every data-driven page has loading, empty, and error states.
- [ ] Unknown routes show a not-found page.
- [ ] Layout works on mobile and desktop.
- [ ] Keyboard focus is visible.
- [ ] No important action relies only on color or an icon.
- [ ] No critical browser-console errors remain.

---

## 15. Definition of done

The frontend is ready for submission when:

1. All required pages and navigation paths are implemented.
2. Student, Facilitator, and Admin experiences are distinct.
3. Topic and resource information is displayed clearly.
4. Upload, download/view, and like interactions are represented and connected to the backend.
5. Forms validate user input and display helpful feedback.
6. Loading, empty, success, and error states are covered.
7. The interface works at desktop and mobile sizes.
8. Role-based UI and route handling are implemented, with backend authorization still enforced.
9. The application has been tested against the main user journeys.
10. You can explain why the pages, components, state, and data flow are organized as they are.

---

## 16. Recommended next step

Before writing the detailed components, sketch **four screens**:

1. Topics listing.
2. Topic details with resource cards.
3. Facilitator upload form.
4. Admin facilitator-management page.

These screens reveal most of the design decisions. Once their layout and behavior are clear, build the shared layout and reusable resource components, then implement the remaining pages.

Keep the first version focused. The aim is not to build the biggest frontend; it is to build the simplest frontend that satisfies the assignment clearly and reliably.
