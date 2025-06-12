# Gap Analysis: Sitecore Pages vs. Sitecore Horizon (v10.2)

## Introduction

This document provides a gap analysis between Sitecore Pages (as described in XM Cloud documentation) and Sitecore Horizon (v10.2, as described in Sitecore Experience Platform documentation). The analysis is based on textual documentation provided by the user. Features were extracted from these documents and then compared to identify unique and common functionalities.

*Important Note: This analysis relies on the interpretation of the provided text. The actual implementation and nuances of features might differ.*

## 1. Key Features of Sitecore Pages (XM Cloud)

# Sitecore Pages: Key Features, Capabilities, and Interface Areas

## I. Overall Purpose & Capabilities
- WYSIWYG page builder for creating and managing web pages.
- Multi-language support for pages.
- Version control for pages, allowing publication of any version.
- Personalization features to tailor content for different audiences.
- Analytics features to assess website performance and content effectiveness.
- Tools for continuous improvement of digital experiences.
- Collaborative environment for building pages with different roles and tools.

## II. Main Interface Tabs/Modes
- **Editor Tab:**
    - Core site building functionalities.
    - Page creation from templates.
    - Site tree management.
    - Page structuring (containers, grids, rows, columns).
    - Drag-and-drop component placement.
    - Content addition to components (from data sources like Media Library, or direct text editing).
    - A/B/n testing setup.
- **Templates Tab:**
    - Building page templates for consistent site structure (headers, footers, key sections).
    - Creation and management of Partial Designs.
    - Creation and management of Page Designs.
    - Assigning Page Designs to Data Templates to create Page Templates.
- **Personalize Tab:**
    - Building web pages with layouts and content customized for different audiences.
- **Analyze Tab:**
    - Checking site-wide performance.
    - Analyzing performance of individual pages and their variants.
    - Providing insights for business decisions.

## III. Key Functionalities & Concepts

### A. Page Creation & Management
- Create pages from templates.
- Create different versions of existing pages.
- Manage page hierarchy in the site tree (create folders, move pages via drag-and-drop).
- Add language versions for pages.
- Edit page settings (item name, display name, page design, insert options).
- Change page design of an existing page.
- Configure insert options for templates and existing pages to enforce information architecture.

### B. Content Authoring & Editing
- WYSIWYG editing directly on the page.
- Adding content to component fields:
    - Selecting assets from data sources (e.g., Media Library).
    - Writing and editing text directly.
    - Assigning existing content items to components.
    - Creating new content items as data sources.
- Rich Text Editor:
    - Formatting text (bold, italic, underline, strikethrough, block quote, super/subscript, font color, background color, headings, alignment).
    - Creating lists (bulleted, numbered).
    - Adding horizontal lines, indents.
    - Creating hyperlinks (external, internal, email, phone).
    - Inserting media files (images with various formats supported).
    - Adding and formatting tables.
    - Find and replace.
    - Source code editing (for HTML, iframes).
    - Keyboard shortcuts for text editing.
- Autosaving of changes.
- Undo/Redo functionality.
- Shared fields: content shared across all versions and languages.
- Unversioned fields: shared across numbered versions in the same language.
- Versioned fields: specific to the current version and language.

### C. Page Structure & Layout (Components)
- Structuring pages with grids, rows, and columns using components like:
    - **Container:** Wrapper for other components, supports background images, allows changing data source for multiple components.
    - **Column Splitter:** Divides page content into up to 8 columns, resizable.
    - **Row Splitter:** Divides page content into up to 8 rows.
- Adding components to pages:
    - Drag-and-drop from Components tab.
    - Components from various origins: Content Editor (renderings/SXA), Forms, Components app (FEaaS, BYOC).
    - Placing components in empty placeholders or before/after existing components.
- Configuring components:
    - **Design Configuration:** Layout, Styling, Advanced styling.
    - **Grid Layout Settings (Bootstrap 5 default):**
        - Responsive breakpoints (extra small to XLL).
        - Column Span, Offset, Order, Component alignment, Display CSS.
        - Override inheritance for responsive settings.
    - **Styling & Advanced Styling:** Spacing, alignment, component-specific options, variants.
- Managing items within components (e.g., Link List).
- Code Components (built in Content Editor):
    - **Media:** Image (with caption, alt text, link).
    - **Navigation:** Link List, Navigation menu.
    - **Page Content:** Page Content (displays fields from data source), Promo, Rich Text, Title.
    - **Page Structure:** Container, Row Splitter, Column Splitter.
- Selecting components and navigating hierarchy in the editor.

### D. Data Sources & Content Items
- Assigning content items from local data sources (e.g., Media Library) to components.
- Creating new content items as data sources for components.
- Assigning data items from external data sources (URL, GraphQL, JSON).
- Editing content items directly from the page builder (opens in Explorer).
- Understanding how changes to shared content items affect multiple pages.

### E. Templates & Designs
- **Partial Designs:** Reusable layouts for page sections (header, footer, main).
- **Page Designs:** Combinations of partial designs defining overall page layout.
- **Data Templates:** Collections of fields describing content (created in Content Editor).
- **Page Templates:** Data templates assigned a page design, used for creating new pages.
- Publishing partial designs and page designs from Templates mode.

### F. Publishing & Versioning
- Publishing pages to make changes live.
- Smart publish (only publishes changed items and their related items).
- Publishing pages with subpages and/or all language versions.
- Workflow integration: items must go through workflow states before publishing.
- Approving/rejecting items in workflow.
- Creating and managing multiple versions of a page.
- Scheduling publishing availability for page versions (start/end dates for when a version is publishable).
- Only one version of a page can be publishable at a time.
- Creating and managing language versions of pages.
- Language fallback strategy support.

### G. Collaboration & Workflow
- Concurrent editing: multiple users working on the same content.
    - Field-level change tracking.
    - Notifications for layout changes made by others ("The item has been modified").
- Shared editing features:
    - **Partial and Page Designs:** Changes in Templates mode apply to all pages using them.
    - **Shared Layout Mode:** Layout edits in Editor mode apply to all page versions (language and numbered).
    - **Shared Fields:** Content edits apply to all versions and languages.

### H. User Interface (Editor Mode)
- **Top Toolbar:**
    - Project, environment, website, and language selection.
    - Shared layout mode switch.
    - Navigation between Editor, Templates, Personalize, Analyze modes.
    - Preview button (opens page in new tab).
    - Publish button.
- **Left-Hand Pane (Editor Mode):**
    - **Pages Tab:** Site tree, page creation, page settings access.
    - **Components Tab:** Lists available components for the site.
    - Search functionality for pages and components.
- **Center Content Area (Editor View):**
    - WYSIWYG display of the page.
    - Page Top Toolbar:
        - Version selection/creation.
        - Editing host selection (default or local).
        - Undo/Redo buttons.
        - Device view icons (for responsive design checking).
- **Right-Hand Pane:**
    - Contextual information and configuration for selected items (components, placeholders).
    - Component styling and configuration.
    - Content assignment to components.
    - Rich text formatting options.
    - A/B/n test setup.
- **Customizing Editor View:**
    - Collapsible side panes.
    - Selecting site or language.
    - Changing device view for responsive preview.
    - Opening page preview in a new browser tab.

## IV. Prerequisites & Setup (Recommended)
- Creation of partial designs and page designs (in Content Editor or page builder).
- Creation of data templates (in Content Editor).
- Development of components (by developers in Content Editor).

## V. Other Notable Features
- Support for different grid systems (Bootstrap 5 default, configurable for others like Tailwind).
- Keyboard shortcuts for text editing.
- Ability to use URL or item ID to navigate directly to a page in the editor.
- Recycle bin for deleted items.
- Site tree management includes creating, deleting, and renaming folders and pages.
- Display names (language-specific, special characters allowed) vs. Item names (used in URLs, no special characters).


## 2. Key Features of Sitecore Horizon (v10.2)

# Sitecore Horizon (Version 10.2): Key Features, Capabilities, and Interface Areas

## I. Overall Purpose & Core Components
- Next-generation editor in Sitecore Experience Platform.
- Comprises two main editing tools:
    - **Pages:** WYSIWYG editor for content with presentation and layout.
        - Focuses on items with a presentation layer.
    - **Content:** Editor for content independent of presentation.
        - Content tree contains all content items for the selected site.
        - Allows editing all fields and viewing metadata.
- **Content Explorer:**
    - Lists items in a flat list (no hierarchy).
    - Find, manage, and sort items using filters and keywords.
- Launched from the Sitecore Launchpad (opens Pages by default).

## II. General Editor Layout & Navigation
- **Three Main Areas:**
    - **A. Left-Hand Pane:**
        - Displays content tree (pages in Pages, all content items in Content).
        - Transforms into a task-specific panel during item creation or rendering addition.
    - **B. Content Area (Middle):**
        - Displays the selected page or item from the content tree.
    - **C. Right-Hand Pane:**
        - Contains information about the selected item (item, field, rendering, placeholder).
        - Used for actions like workflow status changes, rich text formatting.
- **Collapsible Side Panes:** To make more room for the editor.
- **Two Toolbars:**
    - **Horizon Global Toolbar (Top of Browser):**
        - Site selector.
        - Language selector.
        - Editor selector (Pages/Content).
        - Search icon and field.
    - **Local Toolbar (Below Global Toolbar):**
        - Options specific to the current view.
        - Example (Page Editor): Device switcher, mode icons (Page editor, Insights, Field editor, Simulator).
- **Navigation:**
    - Select site or language via global toolbar.
    - Switch between Pages and Content editors via global toolbar.
    - Open page/content item by clicking in the content tree.
    - Use URL or item ID to navigate directly to an item.

## III. Horizon Pages
- WYSIWYG editor for items with a presentation layer.
- Edit fields of the current page and any items rendered on it.
- **Modes/Views in Pages:**
    - **1. Page Editor:** (Default view)
        - Create new pages from templates.
        - Edit existing pages (text, graphics, logos, etc.).
        - Add and remove renderings (components).
        - View page on different devices (device switcher).
        - Undo/Redo functionality.
        - Autosave.
        - Workflow management.
        - Publishing capabilities.
        - Content tree shows items with layout and standard folders.
    - **2. Simulator Mode:**
        - Preview web pages as they will appear on different dates and devices.
        - Useful for campaign previews (before, during, after).
        - Navigate site as on live.
        - Time bar with update indicators for scheduled versions.
    - **3. Insights View:**
        - View analytics/KPIs for the current page and selected device type.
        - Default Insights:
            - Conversion rate by date (last 7 days).
            - Time on page by date (last 7 days).
            - Bounce rate (if high >55% or low <35%).
            - Time on this page (compared to site average).
            - Bounce rate by date (last 7 days).
        - Developers can create new insights.
    - **4. Metadata Editor (Field Editor):**
        - Edit metadata and fields not visible on the page.
        - Field display and editing similar to Horizon Content.

### A. Page Editor Specific Functionalities
- **Page Creation:**
    - Create new pages as subpages or at the same level.
    - Select page templates for creation.
    - Edit item name and display name upon creation.
- **Page Editing:**
    - Edits the latest publishable version.
    - Changes can affect layout, shared fields, unversioned fields, versioned fields.
    - Concurrent editing supported; autosave.
    - Switch language versions for editing.
    - Field Types Editable: Text (single/multi-line), Rich Text, Image, Link, Number.
- **Component (Rendering) Management:**
    - Add components from "Components" tab in left-hand pane.
        - Components grouped by organization in Content Editor.
        - Drag-and-drop to compatible placeholders.
    - Remove renderings (unless non-editable).
    - Assign content items to components or edit locally on page.
- **SXA Components Support:**
    - Extra settings in right-hand pane: Grid layout, Styling, Advanced styling.
    - **Grid Layout:** Sizing (manual columns, auto-fit, auto-fill), responsive behavior.
    - **Styling:** Spacing, alignment.
    - **Advanced Styling:** Component-specific options, image selectors (e.g., Background image for Container).
    - **Component-specific options:** May include "New content item" section for managing data sources of composite components.
- **Image Field Editing:**
    - Add/Change image from Media Library or integrated DAM.
    - Search for images.
    - Clear image from field.
- **Link Field Editing:**
    - Types: Internal (to Sitecore page), External (to URL).
    - Fields: Link text, Link title (tooltip), URL query string, Anchor, Open in new window.
    - Context language/site selection impacts link parameters.
- **Rich Text Field Editing (in Pages):**
    - Edit directly on page.
    - Formatting tools appear in right-hand pane.
    - Applies website's stylesheets for true WYSIWYG.
    - Create external links (URL).
    - Test links (Ctrl+Click).

## IV. Horizon Content
- Content manager for items without a presentation layer.
- Access to all content items for the selected site.
- View metadata for each field.
- Edit content not accessible in Pages.
- **Content Item Creation:**
    - Create new content items based on templates.
    - Create as sub-items or at the same level.
    - Edit item name and display name.
- **Field Editing:**
    - Edits the latest publishable version.
    - Fields determined by templates (Versioned, Unversioned, Shared).
    - Autosave.
    - Field Types:
        - Simple text (single/multi-line).
        - Rich text (opens Rich Text Editor dialog, default styling, HTML editor tab).
        - Checkbox (toggle switch).
        - Number (may have restrictions).
        - Date (type or select from calendar).
        - Time (type or select).
        - Checklist.
        - Image (upload, select from media library/DAM, Alt text).
        - Link (Internal, External, Media).
        - File (upload any type, up to 2GB).
        - Drop-down menu (Drop tree, Drop list - data sources configured by developer).
    - Reset field to standard value (if inherited from template).
- **Rich Text Field Editing (in Content):**
    - Uses "Edit content" button to open Rich Text Editor.
    - Applies default stylesheets.
    - **Visual Editor Tab & HTML Editor Tab:**
        - HTML editor allows applying default classes (content-style-minimal, standard, full).
        - Restricted HTML tags and classes.
    - Create internal and external links.
    - Create anchors (using HTML editor) and link to them.
- **Image Field Editing (in Content):**
    - Upload from computer.
    - Select from Media Library or DAM.
    - Add Alt text.
- **Link Field Editing (in Content):**
    - Types: Internal, External, Media.
    - Fields: Link text, Link title, URL query string, Anchor, Open in new window.

## V. Content Explorer (within Horizon Content)
- Organizes items without fixed content tree hierarchy.
- Lists all content items for the current site by default.
- **Functionalities:**
    - **Queries:** "All content items", "Recently created by me", "Recently modified by me".
    - **Filters:** Template, Workflow state, Created by, Last modified by, Time period.
    - **Keyword Search:** Item ID, path, data within content items (latest version only). Exact match with double quotes. No operators/wildcards.
    - **Sorting:** By any column in the table.
    - Click item name to open for viewing/editing.
    - Share search results via URL.

## VI. Common Features Across Horizon
- **Content Tree Management:**
    - Create folders.
    - Move items via drag-and-drop.
    - Delete items/pages/folders (moves to recycle bin, deletes all versions and subitems).
    - Rename items (changes display name, not item name in Horizon).
- **Autosave, Undo, Redo:**
    - Changes saved automatically at intervals or on field exit.
    - Saved icon in toolbar shows last save time.
    - Undo/Redo buttons in toolbar.
- **Publishing:**
    - Smart publish (only publishes changed items and related content).
    - Publish single item or item with all subitems.
    - Publishes current language version and related items (media, data sources, renderings, layouts, templates, clones).
    - Workflow integration: item must be in final workflow state to publish.
- **Workflow Management:**
    - View current workflow state in right-hand pane.
    - Move item to next workflow state (Approve/Reject with comments).
- **Search (Global Toolbar):**
    - Search for item name, ID, path, or data within items.
    - Filters: All items, Pages, Content, Media.
    - Recent searches list.
    - Opens selected item in a new tab.
- **Keyboard Shortcuts:**
    - For rich text editor (copy, paste, cut, undo, redo, select all, save & close dialog, line break, font formats, list creation).
- **Responsive Design Viewing:**
    - Device switcher (phone, tablet, desktop).
    - Rotate view (landscape/portrait for phone/tablet).
- **Page/Item Structure Concepts:**
    - Page: Page layout + Components.
    - Page Layout: Defines overall structure, created by developer, contains placeholders.
    - Component: Defines part of a page, can contain layout, fields, placeholders, logic. Reusable.
    - Content Item: Collection of fields, can be assigned as data source to components.
- **Data Sources for Components:**
    - Components can use data saved locally on the page item.
    - Components can be assigned a separate content item as a data source (allows content reuse).
    - Create new content item as data source during assignment.
    - Edit content item directly from Page editor (opens in Content editor view).

## VII. Versioning
- Edits latest publishable version by default. (Experience Editor for older/non-publishable versions).
- Changes can affect versioned, unversioned, or shared fields.
- New language version created if editing an item in a language it doesn't exist in yet.


## 3. Gap Analysis Results

The following sections detail features identified as primarily unique to one platform or common to both, based on the provided documentation.

### 3.1. Features Primarily Unique to Sitecore Pages (XM Cloud)

- Explicit "Personalize Tab" as a top-level mode for building customized layouts and content for different audiences.
- Explicit "Analyze Tab" as a top-level mode for site-wide and page-specific performance analysis to base business decisions on.
- A/B/n testing setup directly mentioned as a capability within the Editor tab.
- Detailed "Templates Tab" for creating and managing a design system:
    - Creation and management of Partial Designs (headers, footers, main sections).
    - Creation and management of Page Designs by combining partial designs.
    - Assigning Page Designs to Data Templates (from Content Editor) to create reusable Page Templates.
    - Publishing of partial and page designs from within the Templates mode.
- "Shared Layout Mode" switch in the Editor to propagate layout changes to all page versions (language and numbered).
- Explicit mention of components from "Components app (FEaaS, BYOC)" as usable building blocks.
- Support for assigning data items from external data sources (URL, GraphQL, JSON) to components.
- Explicit mention of "Language fallback strategy support."
- Support for different grid systems (Bootstrap 5 by default, configurable for others like Tailwind).
- Emphasis on certain prerequisites like Data Templates being created in Content Editor by developers.
- "Page content" editing as a distinct concept where fields are inherited from the page's template, separate from component-specific content.
- Structuring pages with Column Splitter (up to 8 columns) and Row Splitter (up to 8 rows) components.
- Configuring insert options for templates and existing pages to enforce information architecture.

### 3.2. Features Primarily Unique to Sitecore Horizon (v10.2)

- Core architectural distinction between two primary tools:
    - **Pages tool:** For WYSIWYG editing of items with a presentation layer.
    - **Content tool:** For editing content items independent of presentation, including all fields and metadata.
- **Content Explorer:** A distinct feature for listing items in a flat view (no hierarchy) with advanced filtering (template, workflow, user, time) and keyword search capabilities.
- **Metadata Editor (Field Editor) in Pages:** A specific mode in Horizon Pages to edit fields not visible on the page canvas, with an interface similar to Horizon Content.
- Simulator mode features a prominent **time bar** with visual indicators for scheduled page version updates, allowing preview across a timeline.
- Detailed field editing capabilities within the **Content tool** for various types:
    - Checkbox fields displayed as toggle switches.
    - Specific Date and Time picker UIs.
    - Checklist field type.
    - File field type for uploading various document types (up to 2GB).
    - Drop-down menu types (Drop tree, Drop list) for selecting Sitecore items, with data sources configured by developers.
- Rich Text Editor in **Content tool** includes an **HTML editor tab** allowing direct HTML manipulation and application of predefined CSS classes (content-style-minimal, -standard, -full).
- Specific procedures for creating internal links and HTML anchors detailed for the Rich Text Editor within the **Content tool**.
- Global search functionality explicitly allows filtering results by Pages, Content items, or Media items.
- Strong emphasis on editing the "latest publishable version" by default. (Experience Editor is mentioned for older/non-publishable versions).
- Detailed description of SXA components integration, including specific right-hand pane sections for "Grid layout", "Styling", and "Advanced styling", and handling of composite component data sources via "New content item" section.

### 3.3. Common / Overlapping Features

- WYSIWYG page editing experience.
- Content/Site Tree Management: Creating pages/items/folders, renaming (display name), deleting, moving via drag-and-drop.
- Multi-language support: Creating and switching between language versions of pages/items.
- Page/Item Creation from Templates.
- Component/Rendering Management: Adding components to pages from a list/tab, drag-and-drop placement, removing components.
- Content Authoring for various field types (general text, rich text, images, links, numbers).
- Rich Text Editor: Common formatting options (bold, italic, lists, etc.).
- Image Handling: Adding/changing images, typically from a Media Library or integrated DAM.
- Link Creation: Internal links (to other Sitecore items/pages) and external links (to URLs).
- Publishing: Smart publish, publishing items with subitems, workflow integration (items need to be in a final state).
- Workflow Management: Moving items through workflow states (approve/reject), viewing current state.
- Autosave functionality for edits.
- Undo/Redo capabilities.
- Responsive Design Previews: Ability to view pages as they appear on different devices (desktop, tablet, phone), including rotation for mobile/tablet.
- Navigation by URL/Item ID: Ability to directly access an item for editing if its ID or URL is known.
- Keyboard shortcuts for Rich Text Editor operations.
- Concept of Shared vs. Versioned Fields: Understanding that some field changes are global while others are version-specific.
- Concurrent Editing: Support for multiple users working simultaneously (though specific conflict handling notifications might differ).
- General UI Structure: Typically a left pane (tree/components), a central content/editing area, and a right pane (contextual details/settings). Collapsible panes for more editing space.
- Assigning content items as data sources to components, and creating new content items for this purpose.
- Editing content of components either locally on the page or in a shared data source item.
- Basic versioning concepts (though detailed management like scheduling differs).
- Search functionality for finding items/pages.

## 4. Summary of Key Differences (Based on Documentation)

A detailed manual review of the feature lists above is recommended to draw comprehensive conclusions. This automated analysis suggests differences primarily in the architectural approach (Horizon's explicit Pages vs. Content tools and Content Explorer vs. Pages' more integrated but XM Cloud-specific tabs like Personalize, Analyze, and Templates), the depth of design system management within the tool (Pages' Templates tab), and specific integrations (XM Cloud Pages mentioning FEaaS/BYOC components and external data sources; Horizon detailing SXA component configuration and specific Content tool field editors). Horizon 10.2 documentation also emphasizes a more traditional content editing capability alongside its WYSIWYG page editor, while XM Cloud Pages seems more focused on a unified page building and experience management paradigm.
