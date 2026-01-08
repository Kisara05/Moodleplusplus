# Quiz Frontend Testing Guide

This guide provides all URLs and steps to test the quiz creation and taking functionality on localhost.

## Prerequisites

1. Start the development server:
   ```bash
   yarn dev
   # or
   npm run dev
   ```

2. The server should start at `http://localhost:5173` (or similar port)

## Test URLs

### Base URL
Replace `localhost:5173` with your actual dev server URL if different.

---

## 1. CREATE QUIZ PAGES (For Teachers/Admins)

### 1.1 Main Create Quiz Form
**URL:** 
```
http://localhost:5173/courses/test-course-123/create-quiz?signed_in=1&user_flag=0
```

**What to test:**
- Form fields (Name, Description, Answer type selection)
- Button changes from "Save" to "Next" when selecting "Multiple choice"
- File upload option appears for multiple choice
- Click "Next" with multiple choice → should navigate to multiplechoice1 or multiplechoice2

**Parameters:**
- `signed_in=1` - Required for authentication
- `user_flag=0` - Teacher/Admin flag (0 = teacher/admin)
- `test-course-123` - Replace with actual course ID if you have one

---

### 1.2 Create Quiz Multiple Choice 1 (No File Upload)
**URL:**
```
http://localhost:5173/courses/test-course-123/create-quiz-multiplechoice1?signed_in=1&user_flag=0
```

**What to test:**
- Text description input
- Image upload box (no text description field)
- Question navigation mini board (widens to fit more questions)
- Answer mode toggle
- Choice input and selection
- Save functionality

**Features:**
- Dynamic question board that adjusts width
- Image upload only (no text description field removed)

---

### 1.3 Create Quiz Multiple Choice 2 (With File Upload)
**URL:**
```
http://localhost:5173/courses/test-course-123/create-quiz-multiplechoice2?signed_in=1&user_flag=0
```

**What to test:**
- Static A, B, C, D choice labels (not editable inputs)
- Choices displayed in a row with "Add more choices" button
- Click choices to mark as correct (turns green)
- Add more choices functionality
- Save functionality

**Features:**
- Static choice labels (A, B, C, D)
- 4 choices per row with "Add more choices" button in same row

---

## 2. TAKE QUIZ PAGES (For Students)

### 2.1 Take Quiz 1 (Multiple Choice with Text/Image)
**URL:**
```
http://localhost:5173/courses/test-course-123/take-quiz-1?signed_in=1&user_flag=1&quizId=quiz1
```

**What to test:**
- White box for text description (top)
- White box for image description (below text)
- 4 choice buttons (click to select, turns green)
- Question navigation mini board on right
- Question status indicators:
  - Current question: Green circle
  - Answered questions: Gray circle
  - Unanswered questions: White circle with border
- Submit button (centered, no Cancel button) → shows confirmation dialog

**Parameters:**
- `user_flag=1` - Student flag (1 = student)
- `quizId=quiz1` - Quiz ID to load

---

### 2.2 Take Quiz 2 (Multiple Choice with File Viewer)
**URL:**
```
http://localhost:5173/courses/test-course-123/take-quiz-2?signed_in=1&user_flag=1&quizId=quiz1
```

**What to test:**
- Gray file viewer box (left side)
- Zoom in/out controls
- File scrolling
- **Table structure on right side:**
  - Column 1: Question index (1-25)
  - Columns 2-5: A, B, C, D choice buttons
  - Click any choice button to select (turns green)
  - Click again to deselect
  - All 25 questions displayed in table
- Submit button (centered, no Cancel button)
- Submit functionality

**Features:**
- File viewer with zoom controls
- **5-column table** showing all questions and choices
- **No mini board** - all questions visible in table
- Selected choices marked green, unselected have no mark

---

### 2.3 Take Quiz Free Response
**URL:**
```
http://localhost:5173/courses/test-course-123/take-quiz-free-response?signed_in=1&user_flag=1&quizId=quiz1
```

**What to test:**
- White box for text description (top)
- Download box on right side of question box
- Rich text editor for answer input
- Editor features: headings, bold, italic, underline, bullets
- Submit button (centered, no Cancel button)
- Submit functionality

**Features:**
- Rich text editor with formatting tools
- File download box positioned correctly

---

## 3. QUIZ CONFIRMATION DIALOG

The confirmation dialog is a component that should be integrated into your course page where quizzes are listed.

### Testing the Dialog Component

To test the dialog, you can create a simple test page or integrate it into your course page:

**Example Integration:**
```tsx
import { useState } from "react";
import QuizConfirmationDialog from "~/components/common/QuizConfirmationDialog";

// In your component:
const [showDialog, setShowDialog] = useState(false);
const [selectedQuiz, setSelectedQuiz] = useState(null);

// When clicking on a quiz:
<button onClick={() => {
  setSelectedQuiz({
    quizId: "quiz1",
    quizName: "Quiz 1",
    answerType: "free_response", // or "multiple_choice"
    hasFile: false, // true for multiplechoice2
    publishTime: {
      date: "2026-01-28",
      hour: "15",
      minute: "00",
      second: "00",
    },
    duration: {
      date: "2026-01-28",
      hour: "16",
      minute: "00",
      second: "00",
    },
    timeLimit: {
      hour: "00",
      minute: "40",
      second: "00",
    },
  });
  setShowDialog(true);
}}>
  Join Quiz
</button>

// Render dialog:
{selectedQuiz && (
  <QuizConfirmationDialog
    isOpen={showDialog}
    onClose={() => {
      setShowDialog(false);
      setSelectedQuiz(null);
    }}
    quiz={selectedQuiz}
    sectionId="test-course-123"
    userFlag={1}
    language="en"
  />
)}
```

**What to test:**
- Dialog displays quiz information correctly
- Date/time formatting
- Click "Confirm" → navigates to correct take-quiz page
- Click "Cancel" → closes dialog, stays on same page
- Navigation routes:
  - Free response → `take-quiz-free-response`
  - Multiple choice (no file) → `take-quiz-1`
  - Multiple choice (with file) → `take-quiz-2`

---

## 4. COMPLETE FLOW TESTING

### Flow 1: Create Free Response Quiz
1. Go to: `/courses/test-course-123/create-quiz?signed_in=1&user_flag=0`
2. Fill in quiz name and description
3. Select "Free response"
4. Click "Save and return to course"
5. Should return to course page

### Flow 2: Create Multiple Choice Quiz (No File)
1. Go to: `/courses/test-course-123/create-quiz?signed_in=1&user_flag=0`
2. Fill in quiz name and description
3. Select "Multiple choice"
4. Select "No" for file upload
5. Button changes to "Next"
6. Click "Next"
7. Should navigate to: `/courses/test-course-123/create-quiz-multiplechoice1?signed_in=1&user_flag=0`
8. Fill in questions and save

### Flow 3: Create Multiple Choice Quiz (With File)
1. Go to: `/courses/test-course-123/create-quiz?signed_in=1&user_flag=0`
2. Fill in quiz name and description
3. Select "Multiple choice"
4. Select "Yes" for file upload
5. Upload a file (optional for frontend testing)
6. Button changes to "Next"
7. Click "Next"
8. Should navigate to: `/courses/test-course-123/create-quiz-multiplechoice2?signed_in=1&user_flag=0`
9. Fill in choices and save

### Flow 4: Take Quiz (Student Flow)
1. From course page, click on a quiz
2. Quiz confirmation dialog appears
3. Review quiz information
4. Click "Confirm"
5. Navigate to appropriate take-quiz page
6. Answer questions
7. Click "Submit"
8. Confirm submission
9. Return to course page

---

## 5. QUICK REFERENCE - ALL URLS

### Create Quiz URLs (Teacher/Admin - user_flag=0)
```
/courses/:courseID/create-quiz?signed_in=1&user_flag=0
/courses/:courseID/create-quiz-multiplechoice1?signed_in=1&user_flag=0
/courses/:courseID/create-quiz-multiplechoice2?signed_in=1&user_flag=0
```

### Take Quiz URLs (Student - user_flag=1)
```
/courses/:courseID/take-quiz-1?signed_in=1&user_flag=1&quizId=quiz1
/courses/:courseID/take-quiz-2?signed_in=1&user_flag=1&quizId=quiz1
/courses/:courseID/take-quiz-free-response?signed_in=1&user_flag=1&quizId=quiz1
```

---

## 6. COMMON ISSUES & SOLUTIONS

### Issue: Page redirects to login
**Solution:** Make sure `signed_in=1` is in the URL

### Issue: Page shows access denied
**Solution:** 
- For create pages: Use `user_flag=0` (teacher/admin)
- For take pages: Use `user_flag=1` (student)

### Issue: Quiz data not loading
**Solution:** Backend functions are stubbed with mock data. Check browser console for errors.

### Issue: Navigation not working
**Solution:** Check that routes are properly added to `routes.ts`

---

## 7. TESTING CHECKLIST

### Create Quiz Pages
- [ ] Main form displays correctly
- [ ] Button changes to "Next" for multiple choice
- [ ] Navigation to multiplechoice1 works
- [ ] Navigation to multiplechoice2 works
- [ ] Multiplechoice1: Image upload only (no text description)
- [ ] Multiplechoice1: Question board widens properly
- [ ] Multiplechoice2: Static A/B/C/D labels
- [ ] Multiplechoice2: Choices in row with "Add more" button

### Take Quiz Pages
- [ ] Take-quiz-1: Text and image boxes display
- [ ] Take-quiz-1: Choices turn green when selected
- [ ] Take-quiz-1: Question navigation works
- [ ] Take-quiz-1: Status indicators work (current/answered/unanswered)
- [ ] Take-quiz-1: No Cancel button (only Submit)
- [ ] Take-quiz-2: File viewer displays
- [ ] Take-quiz-2: Zoom controls work
- [ ] Take-quiz-2: **5-column table structure** (Question, A, B, C, D)
- [ ] Take-quiz-2: All 25 questions displayed in table
- [ ] Take-quiz-2: Choice buttons turn green when selected
- [ ] Take-quiz-2: Click again to deselect choice
- [ ] Take-quiz-2: **No mini board** (all questions in table)
- [ ] Take-quiz-2: No Cancel button (only Submit)
- [ ] Take-quiz-free-response: Rich text editor loads
- [ ] Take-quiz-free-response: Download box positioned correctly
- [ ] Take-quiz-free-response: No Cancel button (only Submit)
- [ ] All pages: Submit confirmation dialog works

### Confirmation Dialog
- [ ] Dialog displays quiz information
- [ ] Date/time formatting correct
- [ ] Confirm navigates to correct page
- [ ] Cancel closes dialog

---

## 8. RECENT UPDATES & FIXES

### Create Quiz Page
- ✅ Duration validation: Shows red error if duration is before publish time
- ✅ Time limit inputs: Hidden when "Set time limit" checkbox is unchecked

### Create Quiz Multiple Choice 1
- ✅ Cancel confirmation: Shows dialog when clicking Cancel
- ✅ Floating mini board: Stays fixed on top right when scrolling
- ✅ Validation: Requires at least text OR image description (not both)
- ✅ Correct answer: Remains marked green when switching modes
- ✅ Navigation: Returns to course page after saving

### Create Quiz Multiple Choice 2
- ✅ Cancel confirmation: Shows dialog when clicking Cancel
- ✅ Validation fix: Only checks if correct answer is selected (not choice text)
- ✅ Navigation: Returns to course page after saving

### Take Quiz 1
- ✅ Floating mini board: Stays fixed on top right when scrolling
- ✅ Image section: Hidden if no image description (pushes answers up)
- ✅ Navigation: Returns to course page after submitting

### Take Quiz 2
- ✅ Scrollable table: Right panel is scrollable, matches left panel height
- ✅ Navigation: Returns to course page after submitting

### Take Quiz Free Response
- ⚠️ Editor import: If you see "Failed to fetch dynamically imported module" error:
  - This is usually a Vite dev server caching issue
  - **Solution**: Restart the dev server (`yarn dev` or `npm run dev`)
  - The import path is correct: `~/components/common/Editor.client`
  - The file exists and matches other working imports in the codebase

---

## Notes

- Replace `test-course-123` with actual course IDs when available
- Replace `quiz1` with actual quiz IDs when available
- Backend functions are stubbed - they return mock data for frontend testing
- All pages support English (`lang=en`) and Vietnamese (`lang=vi`) languages
- If Editor import error persists, try clearing browser cache or restarting dev server
