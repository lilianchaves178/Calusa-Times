# Frontend-Backend Integration Contracts

## Overview
This document outlines the integration plan for The Calusa Times website, currently running as a frontend-only application with mock data.

## Current Frontend Implementation

### Mock Data Location
- **File**: `/app/frontend/src/mockData.js`
- Contains: articles, announcements, spotlight students, achievements

### Article Data Structure
```javascript
{
  id: string,
  category: string, // 'news', 'arts', 'opinion', 'sports', 'poetry', 'science', 'quick thought'
  title: string,
  description: string,
  author: string,
  grade: string,
  date: string,
  featured: boolean,
  image: string // URL to article image
}
```

## Backend Integration Plan

### 1. Database Models

#### Article Model
```python
class Article(BaseModel):
    id: str
    category: str
    title: str
    description: str
    content: str  # Full article content
    author: str
    grade: str
    date: datetime
    featured: bool
    image_url: str  # URL to uploaded image
    created_at: datetime
    updated_at: datetime
```

#### Student Model
```python
class Student(BaseModel):
    id: str
    name: str
    grade: str
    quote: str
    image_url: str
    featured: bool
    created_at: datetime
```

#### Achievement Model
```python
class Achievement(BaseModel):
    id: str
    title: str
    recipient: str
    category: str
    badge: str
    date: datetime
    created_at: datetime
```

### 2. API Endpoints

#### Articles
- `GET /api/articles` - Get all articles (with pagination)
- `GET /api/articles/featured` - Get featured article
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create new article (with image upload)
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `POST /api/articles/:id/upload-image` - Upload article image

#### Students (Spotlight)
- `GET /api/students` - Get all spotlight students
- `GET /api/students/featured` - Get current featured student
- `POST /api/students` - Add student to spotlight
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Remove from spotlight

#### Achievements
- `GET /api/achievements` - Get all achievements
- `POST /api/achievements` - Add new achievement
- `DELETE /api/achievements/:id` - Remove achievement

#### Announcements
- `GET /api/announcements` - Get active announcements
- `POST /api/announcements` - Add announcement
- `DELETE /api/announcements/:id` - Remove announcement

### 3. Image Upload Implementation

#### File Upload Strategy
- Use multipart/form-data for image uploads
- Store images in a persistent directory: `/app/uploads/articles/`
- Generate unique filenames using UUID
- Serve images via static file endpoint: `/api/uploads/:filename`

#### Supported Image Formats
- JPEG, PNG, WebP
- Max file size: 5MB
- Recommended dimensions: 800x600px

#### Frontend Changes Required
1. Update ArticleCard component to handle missing images gracefully
2. Add image upload field in article creation/editing forms
3. Implement image preview before upload
4. Replace mock data imports with API calls

### 4. Frontend API Integration

#### Files to Update
1. **Create API service**: `/app/frontend/src/services/api.js`
   - Centralized API calls using axios
   - Base URL from environment variable

2. **Update HomePage.jsx**
   - Replace `articles` import with `useEffect` + API call
   - Add loading states
   - Add error handling

3. **Update ArticlesPage.jsx**
   - Fetch articles from API
   - Add pagination support

4. **Update ArticleDetailPage.jsx**
   - Fetch individual article from API
   - Display full article content

5. **Create ArticleEditor Component**
   - Form for creating/editing articles
   - Image upload with preview
   - Category selection
   - Rich text editor for content

### 5. Authentication (Future Enhancement)
- Editor button should require authentication
- Only authenticated users (students/teachers) can create/edit content
- Consider JWT-based authentication

## Implementation Steps

### Phase 1: Backend Setup
1. Create MongoDB models
2. Implement CRUD endpoints for articles
3. Add file upload endpoint
4. Test APIs with Postman/curl

### Phase 2: Frontend Integration
1. Create API service layer
2. Update components to fetch from API
3. Add loading and error states
4. Remove mock data imports

### Phase 3: Image Upload Feature
1. Create article editor UI
2. Implement image upload with preview
3. Handle upload progress
4. Add image optimization

### Phase 4: Testing & Polish
1. Test all CRUD operations
2. Test image uploads
3. Add error handling
4. Optimize performance

## Notes
- Current frontend uses Unsplash images as placeholders
- All interactive elements are working with mock data
- The design is finalized and matches the playful gazette theme
- Backend integration should not require major frontend restructuring
