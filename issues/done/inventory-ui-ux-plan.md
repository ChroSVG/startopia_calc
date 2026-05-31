# UI/UX Implementation Plan: Inventory Management

## 1. General Concept
This document describes the User Interface (UI) and User Experience (UX) for the Inventory page. This is a complete abstract plan without code. Your goal is to build a page where users can view, add, edit, and delete inventory items smoothly without fully reloading the browser.

## 2. Screen Layout
The page must be divided into 4 main sections from top to bottom:

**A. Header Section**
*   **Title:** Large text on the top left saying "Inventory".
*   **Primary Action:** A solid button on the top right saying "Add New Item".

**B. Toolbar Section (Below Header)**
*   **Search Box:** A text input with a magnifying glass icon. Used to search items by name.
*   **Filter Dropdown:** A menu to filter items by their status (e.g., "All", "In Stock", "Out of Stock").
*   **View Toggle:** Buttons to switch how data is displayed (Table View vs. Card/Grid View).

**C. Data Display Section (Main Area)**
*   **Table View:** A data table with the following columns:
    *   Item Name
    *   Category
    *   Quantity (Stock Level)
    *   Status (e.g., Active/Inactive)
    *   Actions (Contains "Edit" and "Delete" icons/buttons).
*   **Row Design:** Each row represents one item.

**D. Pagination Section (Bottom)**
*   **Controls:** "Previous" and "Next" buttons.
*   **Information:** Text showing the current page (e.g., "Page 1 of 5").
*   **Selector:** A dropdown to choose how many items to show per page (10, 20, 50).

## 3. Visual States (Feedback)
The system must always inform the user about what is happening:

*   **Loading State:** Show a loading spinner or skeleton (gray placeholder blocks) when fetching data from the server.
*   **Empty State:** If the database is empty or the search has no results, show a friendly image/icon with text "No items found" and a "Clear Search" button.
*   **Success State:** Show a temporary green notification (Toast) at the screen edge when an action is successful (e.g., "Item saved successfully").
*   **Error State:** Show a red notification if something fails (e.g., "Server error, try again").

## 4. User Workflows
Follow these exact steps for user interactions:

**Workflow 1: Adding an Item**
1. User clicks the "Add New Item" button.
2. A popup window (Modal) appears over the page.
3. The Modal contains a form: Name (text), Category (dropdown), Quantity (number).
4. User clicks the "Save" button inside the Modal.
5. Modal closes automatically.
6. Show a green success notification.
7. The new item instantly appears in the main table.

**Workflow 2: Editing an Item**
1. User clicks the "Edit" button on a specific table row.
2. A Modal opens containing the same form, but it is pre-filled with the item's current data.
3. User changes the data and clicks "Save".
4. Modal closes automatically.
5. Show a green success notification.
6. The table row instantly updates with the new data.

**Workflow 3: Deleting an Item**
1. User clicks the "Delete" button on a specific table row.
2. A small warning Modal appears asking: "Are you sure you want to delete this item?".
3. User clicks the "Confirm" button.
4. Modal closes automatically.
5. Show a green success notification.
6. The item instantly disappears from the main table.

## 5. Important Rules & Best Practices
*   **Debounce Search:** When the user types in the search box, wait for 300 milliseconds before sending the search request to the server. Do not search on every single keystroke.
*   **Form Validation:** If the user tries to save an empty form, outline the empty input boxes in red color and show text "This field is required". Do not close the Modal.
*   **Color Meanings:** 
    *   Use Red color only for destructive actions (Delete, Remove).
    *   Use Blue/Primary color for positive actions (Save, Submit, Add).
    *   Use Gray for neutral actions (Cancel, Close).
*   **Mobile Responsive:** If viewed on a mobile phone, hide the less important columns in the table, or automatically switch the layout to Card View so the user does not need to scroll left and right.
