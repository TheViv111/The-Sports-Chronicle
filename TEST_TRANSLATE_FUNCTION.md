# Testing the Translate Blog Posts Edge Function

## Method 1: Using Supabase CLI (Recommended)

### Prerequisites
- Supabase CLI installed
- Logged in to Supabase: `supabase login`
- Linked to your project: `supabase link --project-ref your-project-ref`

### Test Locally

1. **Start local Supabase** (if testing with local DB):
```bash
supabase start
```

2. **Serve the function locally**:
```bash
supabase functions serve translate-blog-posts --no-verify-jwt
```

3. **Test with curl** (in another terminal):

**Test with default (1 post):**
```bash
curl -X POST http://localhost:54321/functions/v1/translate-blog-posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Test with limit:**
```bash
curl -X POST http://localhost:54321/functions/v1/translate-blog-posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"limit": 3}'
```

**Test specific post:**
```bash
curl -X POST http://localhost:54321/functions/v1/translate-blog-posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"postId": "your-post-id-here"}'
```

### Set Environment Variables Locally

Create a `.env` file in `supabase/functions/translate-blog-posts/`:
```env
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
DEEPSEEK_API_KEY=your-deepseek-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Or use Supabase secrets:
```bash
supabase secrets set GEMINI_API_KEY=your-key
supabase secrets set GROQ_API_KEY=your-key
supabase secrets set DEEPSEEK_API_KEY=your-key
```

---

## Method 2: Test in Production (After Deployment)

### Deploy the Function

```bash
supabase functions deploy translate-blog-posts
```

### Test via HTTP Request

**Using curl:**
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/translate-blog-posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"limit": 1}'
```

**Using JavaScript/Fetch:**
```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/translate-blog-posts`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}` // or use service role key for admin access
    },
    body: JSON.stringify({
      limit: 1  // or postId: "specific-post-id"
    })
  }
);

const result = await response.json();
console.log(result);
```

**Using Postman/Insomnia:**
- URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/translate-blog-posts`
- Method: `POST`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_ANON_KEY`
- Body (JSON):
```json
{
  "limit": 1
}
```

---

## Method 3: Test from Browser Console

If you're already authenticated in your app:

```javascript
// In browser console on your site
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-blog-posts`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
    },
    body: JSON.stringify({ limit: 1 })
  }
);

const result = await response.json();
console.log(result);
```

---

## Method 4: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** → **translate-blog-posts**
3. Click **Invoke Function**
4. Enter request body:
```json
{
  "limit": 1
}
```
5. Click **Invoke**

---

## Request Body Options

```json
// Process 1 post (default)
{}

// Process multiple posts (max 10)
{
  "limit": 5
}

// Process specific post
{
  "postId": "abc123-def456-ghi789"
}

// Combine (postId takes precedence)
{
  "postId": "abc123",
  "limit": 1
}
```

---

## Expected Response

**Success:**
```json
{
  "success": true,
  "message": "Processed 1/1 posts (25 total translations)",
  "availableProviders": ["Gemini", "Groq", "DeepSeek"],
  "results": [
    {
      "postId": "abc123",
      "title": "Post Title",
      "success": true,
      "languages": 25,
      "providersUsed": ["Gemini"]
    }
  ]
}
```

**No posts to translate:**
```json
{
  "success": true,
  "message": "No posts need translation. Checked 5 posts, all appear to have translations.",
  "availableProviders": ["Gemini", "Groq", "DeepSeek"],
  "totalPostsChecked": 5
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Check Logs

**Local:**
- Logs appear in the terminal where you ran `supabase functions serve`

**Production:**
- Supabase Dashboard → Edge Functions → translate-blog-posts → Logs
- Or use CLI: `supabase functions logs translate-blog-posts`

---

## Troubleshooting

1. **"No API keys configured"**
   - Set environment variables in Supabase Dashboard → Settings → Edge Functions → Secrets
   - Or use `supabase secrets set KEY_NAME=value`

2. **"Supabase credentials missing"**
   - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

3. **"No posts need translation"**
   - Check that posts actually have empty/null translations
   - Increase the limit or check the query

4. **CORS errors**
   - Make sure you're including the `Authorization` header
   - The function already handles CORS, but the request must be valid

