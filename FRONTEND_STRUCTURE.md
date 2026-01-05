# Frontend Code Structure Guide

## Project Overview
This is a Remix-based Moodle++ application with file-based routing. The frontend code is organized in the `src/` directory.

## Color Scheme
- **Light Gray**: `#D9D9D9`
- **Black**: `#000000`
- **Medium Gray**: `#B3B3B3`
- **White**: `#FFFFFF`
- **Teal**: `#2C8B85`
- **Dark Gray**: `#565656`
- **Green**: `#0A853F`

## Border Radius
All boxes and backgrounds use **25px border radius**.

## Where to Add Frontend Code for Each Frame

### 1. Static Components (Used Across All Pages)

#### Header Component
**Location**: `src/components/layout/header.tsx`

- **Props**:
  - `signed_in` (boolean): Determines header type
    - `true` = Type 1 (signed in) - shows navigation, icons, user menu
    - `false` = Type 2 (not signed in) - shows logo and language selector
  - `user_flag` (number): 1 = student, 0 = teacher/admin
  - `language` ("en" | "vi"): Current language
  - `onLanguageChange`: Callback for language toggle

- **Features**:
  - Help icon (shows instructions)
  - Notifications bell (shows announcements)
  - Messages icon (shows messages)
  - User avatar with dropdown (language selection, logout)
  - Navigation links (Dashboard, My courses, Course registration)

#### Footer Component
**Location**: `src/components/layout/footer.tsx`

- **Props**:
  - `language` ("en" | "vi"): Current language

- **Features**:
  - Project information
  - Contact email addresses
  - "Powered by Moodle" link

### 2. Main Screen (Signed In - Type 1)

**Location**: `src/routes/_public._index.tsx`

**Features Implemented**:
1. ✅ Search bar with search functionality
2. ✅ "My courses" section with course cards
3. ✅ "Course categories" section with year buttons
4. ✅ Click handlers for:
   - Dashboard (placeholder - implement later)
   - My courses / All courses (navigates to `/courses`)
   - Course registration (placeholder - implement later)
   - Individual course cards (navigates to `/courses/:courseID`)
   - Category buttons (filters courses)

**To Implement Later**:
- Dashboard page (`/dashboard`)
- Course registration page (`/course-registration`)
- Course detail pages (student vs teacher views based on `user_flag`)

### 3. Login Page (Not Signed In - Type 2)

**Location**: `src/routes/_public.login.tsx`

**Features Implemented**:
1. ✅ UserID and Password input fields
2. ✅ Login form submission
3. ✅ Help icon (shows instructions)
4. ✅ Language toggle (English/Vietnamese)
5. ✅ "Forget password" link (navigates to `/forget-password`)
6. ✅ Error handling and display

**Backend Integration**:
- Uses `src/services/auth.server.ts` `login()` function
- Currently accepts any UserID/Password (placeholder)
- Returns `user_flag` (1 = student, 0 = teacher/admin)
- Redirects to main screen on success

### 4. Forget Password Page

**Location**: `src/routes/_public.forget-password.tsx`

**Status**: Placeholder page (to be implemented later)

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── header.tsx          # Static header (Type 1 & Type 2)
│   │   └── footer.tsx          # Static footer
│   └── common/
│       ├── button.tsx          # (Commented out - can be used)
│       ├── input.tsx           # (Commented out - can be used)
│       └── modal.tsx           # (Commented out - can be used)
├── routes/
│   ├── _public.tsx             # Public layout wrapper
│   ├── _public._index.tsx      # Main screen (signed in)
│   ├── _public.login.tsx       # Login page
│   ├── _public.forget-password.tsx  # Forget password page
│   ├── _public.course/         # Course-related routes
│   ├── _public.admin/          # Admin routes
│   └── ...
├── services/
│   ├── auth.server.ts         # Authentication logic
│   ├── user.server.ts         # User management
│   └── ...
├── styles/
│   └── app.css                # Global styles with color variables
└── types/
    └── user.ts                 # TypeScript type definitions
```

## Adding New Pages/Frames

### Step 1: Create Route File
Create a new file in `src/routes/` following the naming convention:
- `_public.pagename.tsx` for public pages
- `_public.pagename.$param.tsx` for pages with parameters

### Step 2: Include Header and Footer
Every page should include:
```tsx
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";

// In your component:
<Header signed_in={true/false} user_flag={1/0} language="en" />
{/* Your page content */}
<Footer language="en" />
```

### Step 3: Use Consistent Styling
- Use CSS variables from `app.css`:
  - `var(--color-teal)` for `#2C8B85`
  - `var(--color-green)` for `#0A853F`
  - `var(--border-radius)` for `25px`
- Apply `borderRadius: "25px"` to all boxes/backgrounds

### Step 4: Handle Authentication State
- Check `signed_in` flag in loader
- Redirect to `/login` if not signed in (for protected pages)
- Pass `user_flag` to determine student vs teacher/admin features

## Navigation Flow

```
/login (signed_in=0)
  ↓ [Login Success]
/?signed_in=1&user_flag=1 (Main Screen)
  ↓ [Click Dashboard]
/dashboard (to be implemented)
  ↓ [Click My courses / Course card]
/courses (to be implemented)
  ↓ [Click Course]
/courses/:courseID (existing, needs user_flag handling)
  ↓ [Click Course registration]
/course-registration (to be implemented)
```

## Backend Integration Points

### Authentication
- **File**: `src/services/auth.server.ts`
- **Function**: `login({ userId, password })`
- **Returns**: `{ success: boolean, user_flag: number, id: string }`
- **TODO**: Implement actual database/Supabase authentication

### Session Management
- Currently using URL parameters (`signed_in`, `user_flag`)
- **TODO**: Implement proper session/cookie management
- **Location**: Should be added to `src/services/auth.server.ts`

## Language Support

Both pages support English and Vietnamese:
- Toggle via Header language selector
- Language state managed in each component
- Passed as URL parameter (`?lang=en` or `?lang=vi`)

## Next Steps to Implement

1. **Dashboard Page** (`/dashboard`)
   - Create `src/routes/_public.dashboard.tsx`
   - Add route to `src/routes.ts`

2. **Course Registration Page** (`/course-registration`)
   - Create `src/routes/_public.course-registration.tsx`
   - Only visible for students (`user_flag === 1`)

3. **My Courses Page** (`/courses`)
   - Update `src/routes/_public.courses.tsx`
   - Filter courses by user

4. **Course Detail Pages**
   - Update `src/routes/_public.course/$courseID.tsx`
   - Show different views based on `user_flag`:
     - Student view: `course_student` frame
     - Teacher view: `course_teacher` frame

5. **Session Management**
   - Implement cookie-based sessions
   - Replace URL parameter authentication
   - Add session validation in loaders

6. **Backend Authentication**
   - Connect to Supabase/database
   - Implement password hashing
   - Add user verification logic
