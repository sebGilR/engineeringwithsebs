# Dashboard Backend Integration Plan

## Overview
Wire up the engineeringwithsebs Next.js frontend dashboard to the baas Rails backend API. The backend has full post/blog CRUD operations ready; the frontend has the UI but placeholder data.

---

## Current State

### ✅ What's Working
- Authentication flow (login/signup/logout)
- Dashboard UI and navigation
- All page layouts and forms
- API utility function (`fetchFromBaasAPI`)
- Backend has complete Posts API

### ❌ What's Missing
- No API routes for posts/blogs
- All dashboard pages use placeholder data
- No actual data fetching or mutations
- No error handling for post operations
- No blog selection (single vs multi-blog)

---

## Backend API Reference

### Base URL
`http://localhost:3000/api/v1`

### Authentication
All requests require: `Authorization: Bearer <access_token>`
Access token stored in httpOnly cookie by auth routes.

### Available Endpoints

#### Posts Resource
```
GET    /api/v1/posts              - List posts
POST   /api/v1/posts              - Create post
GET    /api/v1/posts/:id          - Get single post
PATCH  /api/v1/posts/:id          - Update post
DELETE /api/v1/posts/:id          - Delete post
POST   /api/v1/posts/:id/publish  - Publish post
POST   /api/v1/posts/:id/unpublish - Unpublish post
```

#### Request Format (JSON:API)
```json
{
  "data": {
    "type": "post",
    "attributes": {
      "title": "My Post",
      "slug": "my-post",
      "excerpt": "Brief description",
      "content": "Plain text or HTML",
      "content_json": {},
      "content_html": "<h1>...</h1>",
      "content_text": "Plain text version",
      "status": "draft",
      "featured": false,
      "blog_id": "uuid",
      "seo_title": "SEO Title",
      "seo_description": "SEO Description",
      "metadata": {}
    }
  }
}
```

#### Response Format
```json
{
  "data": {
    "id": "uuid",
    "type": "post",
    "attributes": {
      "title": "My Post",
      "slug": "my-post",
      "excerpt": "...",
      "content": "...",
      "content_json": {},
      "content_html": "...",
      "content_text": "...",
      "status": "draft",
      "published_at": null,
      "featured": false,
      "reading_time_minutes": 5,
      "created_at": "...",
      "updated_at": "..."
    },
    "relationships": {
      "blog": { "data": { "id": "uuid", "type": "blog" } },
      "author": { "data": { "id": "uuid", "type": "user" } }
    }
  }
}
```

#### Pagination & Filtering
Query parameters:
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20, max: 100)
- `blog_id` - Filter by blog UUID
- `status` - Filter by status (draft/published/scheduled/archived)
- `featured` - Boolean, filter featured posts only
- `include` - Comma-separated relationships (e.g., `blog,author,tags`)

---

## Implementation Plan

### Phase 1: Blog Selection & Context (CRITICAL FIRST STEP)

**Problem:** Backend requires `blog_id` for creating posts, but frontend has no blog concept yet.

**Decision Point:**
- Option A: Single blog per user (simpler, matches "personal blog" use case)
- Option B: Multi-blog support (more complex, matches backend capability)

**Recommendation:** Start with Option A (single blog), add Option B later.

#### Tasks:
1. **Create Blog Context/Store**
   - File: `lib/contexts/BlogContext.tsx`
   - Fetch user's blogs on dashboard mount
   - If no blog exists, create default blog
   - Store current blog ID in context
   - Provide blog to all dashboard pages

2. **Create Blog API Routes**
   - `app/api/blogs/route.ts` - GET (list), POST (create)
   - `app/api/blogs/[id]/route.ts` - GET, PATCH, DELETE

3. **Update Dashboard Layout**
   - File: `app/(app)/layout.tsx`
   - Wrap with BlogProvider
   - Handle blog loading state
   - Auto-create blog if none exists

---

### Phase 2: Posts List Page

**File:** `app/(app)/dashboard/posts/page.tsx`

#### Tasks:
1. **Create Posts API Route**
   - File: `app/api/posts/route.ts`
   - GET handler:
     - Extract access_token from cookies
     - Get blog_id from query params or context
     - Call `/api/v1/posts?blog_id=...&status=...`
     - Return transformed response
   - POST handler (for creating posts):
     - Extract access_token from cookies
     - Validate request body
     - Call `/api/v1/posts` with blog_id
     - Return new post data

2. **Update Posts List Page**
   - Replace placeholder posts array with API call
   - Use React Query or SWR for data fetching:
     ```tsx
     const { data, isLoading, error } = useQuery({
       queryKey: ['posts', filter],
       queryFn: () => fetch(`/api/posts?status=${filter}`).then(r => r.json())
     })
     ```
   - Handle loading state (skeleton or spinner)
   - Handle error state (error banner)
   - Map API response to UI components
   - Wire up filter tabs to query params

3. **Add Delete Post Functionality**
   - Add trash icon to each post row
   - Confirm dialog before delete
   - Call DELETE `/api/posts/[id]`
   - Optimistic update or refetch

#### API Route Implementation Example:
```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchFromBaasAPI } from '@/lib/server/api';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const blogId = searchParams.get('blog_id') || '';

  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (blogId) params.append('blog_id', blogId);

    const data = await fetchFromBaasAPI(
      `/api/v1/posts?${params.toString()}`,
      {
        method: 'GET',
        accessToken,
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

### Phase 3: Create Post Page

**File:** `app/(app)/dashboard/posts/new/page.tsx`

#### Tasks:
1. **Wire Up Form Submission**
   - Remove placeholder handler
   - Call POST `/api/posts` with form data
   - Include blog_id from context
   - Handle validation errors from backend
   - On success: redirect to edit page with new post ID

2. **Add Form Validation**
   - Use React Hook Form + Zod (already installed)
   - Validate title (required, max 255)
   - Validate slug (required, alphanumeric + hyphens)
   - Show inline error messages

3. **Improve UX**
   - Auto-generate slug from title in real-time
   - Show character count for title/excerpt
   - Disable submit while loading
   - Show toast on success/error

#### Implementation Example:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        status: 'draft',
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create post');
    }

    const { data } = await res.json();
    router.push(`/dashboard/posts/${data.id}/edit`);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

### Phase 4: Edit Post Page

**File:** `app/(app)/dashboard/posts/[id]/edit/page.tsx`

#### Tasks:
1. **Create Single Post API Route**
   - File: `app/api/posts/[id]/route.ts`
   - GET handler: Fetch post details
   - PATCH handler: Update post
   - DELETE handler: Delete post

2. **Create Publish/Unpublish API Routes**
   - File: `app/api/posts/[id]/publish/route.ts`
   - POST handler: Call `/api/v1/posts/:id/publish`

   - File: `app/api/posts/[id]/unpublish/route.ts`
   - POST handler: Call `/api/v1/posts/:id/unpublish`

3. **Load Post Data on Mount**
   - Use useEffect or React Query
   - Fetch from GET `/api/posts/[id]`
   - Populate form fields
   - Handle loading and error states

4. **Wire Up Save Draft**
   - Call PATCH `/api/posts/[id]`
   - Include all form fields in request
   - Show success toast
   - Update local state without redirect

5. **Wire Up Publish/Unpublish**
   - Call POST `/api/posts/[id]/publish`
   - Handle validation errors (backend requires content)
   - On success: update status badge, show toast
   - For unpublish: similar flow

6. **Implement Autosave**
   - Use debounce (500ms-1000ms)
   - Track unsaved changes
   - Call PATCH `/api/posts/[id]` silently
   - Update autosave timestamp indicator
   - Don't show errors, just retry

7. **Add Unsaved Changes Warning**
   - Track dirty state
   - Show browser confirmation on navigation
   - Disable during save/autosave

#### Implementation Example:
```typescript
// Load post on mount
useEffect(() => {
  const loadPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/posts/${params.id}`);

      if (!res.ok) throw new Error('Failed to load post');

      const { data } = await res.json();
      setTitle(data.attributes.title);
      setSlug(data.attributes.slug);
      setExcerpt(data.attributes.excerpt || '');
      setContent(data.attributes.content || '');
      setStatus(data.attributes.status);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  loadPost();
}, [params.id]);

// Save draft
const handleSaveDraft = async () => {
  try {
    setSaving(true);
    const res = await fetch(`/api/posts/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
      }),
    });

    if (!res.ok) throw new Error('Failed to save');

    // Show success toast
    alert('Draft saved!');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
};

// Publish
const handlePublish = async () => {
  try {
    setPublishing(true);

    // First save current changes
    await handleSaveDraft();

    // Then publish
    const res = await fetch(`/api/posts/${params.id}/publish`, {
      method: 'POST',
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to publish');
    }

    setStatus('published');
    alert('Post published!');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setPublishing(false);
  }
};

// Autosave with debounce
useEffect(() => {
  if (!hasUnsavedChanges) return;

  const timer = setTimeout(() => {
    handleAutosave();
  }, 1000);

  return () => clearTimeout(timer);
}, [title, slug, excerpt, content]);

const handleAutosave = async () => {
  try {
    await fetch(`/api/posts/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, excerpt, content }),
    });

    setLastSaved(new Date());
    setHasUnsavedChanges(false);
  } catch (err) {
    // Silent fail, autosave will retry
    console.error('Autosave failed:', err);
  }
};
```

---

### Phase 5: Error Handling & UX Polish

#### Tasks:
1. **Unified Error Handling**
   - Create error toast component
   - Handle 401 (redirect to login)
   - Handle 403 (permission denied)
   - Handle 422 (validation errors)
   - Handle 500 (server errors)

2. **Loading States**
   - Skeleton screens for lists
   - Spinner for form submissions
   - Disable buttons during mutations
   - Show progress indicators

3. **Success Feedback**
   - Toast notifications for actions
   - Optimistic UI updates
   - Smooth transitions

4. **Form Improvements**
   - Client-side validation with Zod
   - Server-side error display
   - Field-level error messages
   - Auto-focus on error fields

---

### Phase 6: State Management (Optional)

#### Option A: React Query (Recommended)
Already installed. Provides:
- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication

#### Option B: SWR
Lighter alternative to React Query.

#### Option C: Plain useState + useEffect
Current approach, works fine for simple cases.

**Recommendation:** Use React Query for better developer experience and performance.

---

## File Structure

### New Files to Create
```
app/api/
  posts/
    route.ts              # GET (list), POST (create)
    [id]/
      route.ts            # GET, PATCH, DELETE
      publish/
        route.ts          # POST (publish)
      unpublish/
        route.ts          # POST (unpublish)
  blogs/
    route.ts              # GET (list), POST (create)
    [id]/
      route.ts            # GET, PATCH, DELETE

lib/
  contexts/
    BlogContext.tsx       # Blog selection context
  hooks/
    usePosts.ts           # React Query hooks for posts
    usePost.ts            # React Query hook for single post
  utils/
    slugify.ts            # Slug generation utility
    validation.ts         # Zod schemas
```

### Files to Modify
```
app/(app)/
  layout.tsx                      # Add BlogProvider
  dashboard/
    posts/
      page.tsx                    # Wire up API
      new/
        page.tsx                  # Wire up API
      [id]/
        edit/
          page.tsx                # Wire up API

components/
  ui/
    Toast.tsx                     # New: Toast notification component
    ErrorBanner.tsx               # New: Error display component
```

---

## Implementation Order

### Week 1: Foundation
1. ✅ Fix Rails JSON:API parsing (DONE)
2. Create Blog context and API routes
3. Test blog creation and selection
4. Update dashboard layout with blog provider

### Week 2: Read Operations
1. Create GET `/api/posts` route
2. Wire up posts list page
3. Add filtering by status
4. Add loading and error states

### Week 3: Create Operations
1. Create POST `/api/posts` route
2. Wire up new post form
3. Add form validation
4. Test create → edit flow

### Week 4: Update Operations
1. Create GET/PATCH `/api/posts/[id]` routes
2. Wire up edit page load
3. Wire up save draft
4. Implement autosave
5. Add unsaved changes warning

### Week 5: Publish Operations
1. Create publish/unpublish routes
2. Wire up publish button
3. Wire up unpublish button
4. Add delete functionality
5. Polish error handling and UX

---

## Testing Checklist

### Posts List
- [ ] Shows loading state on initial load
- [ ] Displays all posts correctly
- [ ] Filter by All/Draft/Published works
- [ ] Click post navigates to edit page
- [ ] Status badges show correct colors
- [ ] Empty state shows when no posts
- [ ] Pagination works (if implemented)
- [ ] Delete post works with confirmation

### Create Post
- [ ] Form validates required fields
- [ ] Slug auto-generates from title
- [ ] Excerpt is optional
- [ ] Submit creates post successfully
- [ ] Redirects to edit page with new post ID
- [ ] Shows error if creation fails
- [ ] Cancel button returns to posts list

### Edit Post
- [ ] Loads post data on mount
- [ ] Shows loading spinner while fetching
- [ ] Displays error if post not found
- [ ] All fields editable
- [ ] Save Draft updates post
- [ ] Publish button works (with validation)
- [ ] Unpublish button works (if published)
- [ ] Autosave works every 1s
- [ ] Autosave indicator updates
- [ ] Warns on unsaved changes
- [ ] Status badge reflects current state

### Error Handling
- [ ] 401 redirects to login
- [ ] 403 shows permission error
- [ ] 422 shows validation errors
- [ ] 500 shows server error
- [ ] Network errors handled gracefully
- [ ] Retry mechanism for failed requests

---

## Environment Variables

Required in `.env.local`:
```bash
# Frontend
NEXT_PUBLIC_SITE_URL=http://localhost:3002
BAAS_API_URL=http://localhost:3000

# Backend
# (already configured in baas/.env)
```

---

## Dependencies

### Already Installed ✅
- `@tanstack/react-query` - State management
- `react-hook-form` - Form handling
- `zod` - Validation
- `@tiptap/react`, `@tiptap/starter-kit` - Rich editor (Phase 3)

### May Need to Add
- `react-hot-toast` or `sonner` - Toast notifications
- `date-fns` - Date formatting
- `use-debounce` - Autosave debouncing

---

## Future Enhancements (Post-MVP)

1. **Rich Content Editor (Phase 3)**
   - Integrate Tiptap
   - Add image upload
   - Add code blocks with syntax highlighting
   - Add markdown shortcuts

2. **Multi-Blog Support**
   - Blog switcher in dashboard
   - Create/manage multiple blogs
   - Per-blog settings

3. **Categories & Tags**
   - Tag management UI
   - Category assignment
   - Filter by tags/categories

4. **SEO Optimization**
   - SEO fields in edit form
   - Preview how post looks in search results
   - Open Graph tags

5. **Scheduling**
   - Schedule posts for future publication
   - Timezone handling
   - Draft scheduling

6. **Revisions**
   - View post history
   - Restore previous versions
   - Compare revisions

7. **Analytics**
   - View count tracking
   - Popular posts
   - Dashboard metrics

---

## Notes

- Backend uses UUID for IDs (not integer)
- All timestamps in ISO 8601 format
- Status is enum: draft (0), published (1), scheduled (2), archived (3)
- Content fields: `content` (legacy), `content_json` (Tiptap), `content_html`, `content_text`
- Backend automatically generates `content_html` and `content_text` from `content_json`
- Excerpt auto-generated if not provided
- Reading time calculated automatically (200 words/min)

---

## Questions to Resolve

1. **Blog Selection:** Single blog or multi-blog for MVP?
   - Recommendation: Single blog, add switcher later

2. **State Management:** React Query or plain fetch?
   - Recommendation: React Query (already installed)

3. **Toast Library:** Which toast library to use?
   - Recommendation: `sonner` (modern, headless, good DX)

4. **Content Format:** Use `content` or `content_json` for Phase 1-2?
   - Recommendation: Use `content` (plain text) until Tiptap integrated

5. **Autosave Interval:** How often to autosave?
   - Recommendation: 1000ms debounce (1s after last change)

6. **Error Handling:** Toast or inline errors?
   - Recommendation: Both - inline for validation, toast for operations

---

## Success Criteria

Phase 1-5 complete when:
- ✅ User can create a post
- ✅ User can view list of posts filtered by status
- ✅ User can edit a post and save changes
- ✅ User can publish/unpublish a post
- ✅ User can delete a post
- ✅ Autosave works reliably
- ✅ All API errors handled gracefully
- ✅ Loading states show appropriately
- ✅ No placeholder data remains
- ✅ Navigation flows logically

---

## Risk & Mitigation

### Risk 1: Blog ID Required
**Risk:** Backend requires blog_id, frontend has no blog concept.
**Mitigation:** Create blog context, auto-create default blog on first dashboard visit.

### Risk 2: Token Expiration
**Risk:** Access token expires during editing.
**Mitigation:** Implement token refresh logic, retry failed requests with new token.

### Risk 3: Unsaved Changes
**Risk:** User loses work if they navigate away.
**Mitigation:** Browser beforeunload warning, autosave every 1s.

### Risk 4: API Schema Mismatch
**Risk:** Frontend expects different response format than backend provides.
**Mitigation:** Create TypeScript types from backend serializers, use Zod for runtime validation.

### Risk 5: Concurrent Edits
**Risk:** Multiple tabs editing same post causes conflicts.
**Mitigation:** Show warning if post updated_at changed since load (out of scope for MVP).

---

## Timeline Estimate

- **Phase 1 (Blog Context):** 1 day
- **Phase 2 (Posts List):** 1-2 days
- **Phase 3 (Create Post):** 1 day
- **Phase 4 (Edit Post):** 2-3 days
- **Phase 5 (Polish):** 1-2 days

**Total: 6-9 days** for full MVP dashboard integration.

---

## Next Steps

1. Decide on blog selection strategy (single vs multi)
2. Create blog context and API routes
3. Test blog creation flow
4. Move to posts list implementation
5. Iterate through phases 2-5

Let's start with Phase 1! 🚀
