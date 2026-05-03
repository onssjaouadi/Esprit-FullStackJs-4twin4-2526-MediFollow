# MediFollow AI Services - Troubleshooting & Diagnostic Guide

## Quick Diagnostics

Run this command to check system health:

```bash
npm run check-ai-status
```

---

## Section 1: Authentication Issues

### Problem: 401 "Not authenticated" on API endpoints

**Symptoms:**

- POST requests return `{ error: "Not authenticated" }`
- Logs show `User: null`

**Root Causes & Solutions:**

1. **Missing or Invalid JWT Token**

   ```
   Cause: Token not in Authorization header or cookies
   Solution:
   - Check Authorization header: Bearer <token>
   - Check httpOnly cookie: accessToken
   - Regenerate token: POST /api/auth/login
   - Verify JWT_SECRET matches between frontend/backend
   ```

2. **Token Expired**

   ```
   Cause: Token older than 24 hours
   Solution:
   - Use refresh token endpoint
   - POST /api/auth/refresh with refreshToken
   - Store new accessToken in secure cookie
   ```

3. **User Inactive (New Patients)**

   ```
   Cause: New patients have isActive: false by default
   Note: Patients CAN submit questionnaire before approval
   Solution:
   - Check user role is PATIENT in token
   - If role is other (NURSE, ADMIN), verify isActive: true
   ```

4. **API Route Context Issue**
   ```
   Cause: Using cookies() function in API route
   Solution:
   - Use getCurrentUserFromRequest(req) instead
   - Import from lib/auth-api.ts
   - Pass NextRequest object directly
   Example:
   import { getCurrentUserFromRequest } from '@/lib/auth-api';
   export async function POST(req: NextRequest) {
     const user = await getCurrentUserFromRequest(req);
     // user is now properly authenticated
   }
   ```

---

## Section 2: AI Provider Issues

### Groq API Problems

**Problem: "Rate limit exceeded"**

```
Free tier: 30 requests/minute
Solution:
1. Implement exponential backoff
2. Queue requests with delay
3. Cache similar queries
4. Upgrade to paid tier if needed

Code example:
async function callGroqWithRetry(payload, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await groq.chat.completions.create(payload);
    } catch (error) {
      if (error.status === 429) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(r => setTimeout(r, delay));
      } else throw error;
    }
  }
}
```

**Problem: "Invalid API key"**

```
Solution:
1. Verify GROQ_API_KEY in .env.local
2. Test key: npm run test-groq-key
3. Check key not expired in console.groq.com
4. Regenerate key if needed
```

**Problem: Model not found**

```
Solution:
1. Available models in Groq:
   - llama-3.1-70b-versatile (fast)
   - llama-3.3-70b-versatile (better quality)
   - mixtral-8x7b-32768 (efficient)
2. Update model name in configuration
3. Verify model accessibility in your region
```

### Azure OpenAI Issues

**Problem: "403 Unauthorized" Azure OpenAI**

```
Solution:
1. Check these environment variables:
   - AZURE_OPENAI_API_KEY (32-character hex)
   - AZURE_OPENAI_ENDPOINT (ends with /)
   - AZURE_OPENAI_DEPLOYMENT (exact name)
   - AZURE_OPENAI_API_VERSION (2024-02-15-preview)

2. Test in Azure Portal:
   - Go to Azure OpenAI Resource
   - Check Deployment > Model running
   - Verify API version in deployment

3. Verify credentials:
   npm run test-azure-key
```

**Problem: "Model deployment not found"**

```
Solution:
1. List deployed models:
   az cognitiveservices account deployment list \
   --resource-group YOUR_GROUP \
   --name YOUR_RESOURCE

2. Verify deployment name matches exactly
   (case-sensitive)

3. If missing, create deployment:
   - Azure Portal > Deployments
   - Select model version
   - Set capacity units
```

**Problem: "Quota exceeded" Azure**

```
Solution:
1. Check current usage:
   - Azure Portal > Metrics
   - Monitor tokens/min

2. Options:
   - Wait for quota reset (monthly)
   - Upgrade pricing tier
   - Reduce concurrent requests
   - Implement request batching
```

---

## Section 3: Face Recognition Issues

### Problem: Face detection not working

**Symptoms:**

- Camera loads but no face detected
- "No faces found" message
- Continuous loading

**Solutions:**

1. **Camera Permission Denied**

   ```
   Cause: Browser/system camera permission
   Solution:
   - Check browser permissions (Settings > Privacy)
   - For HTTPS: camera auto-allowed
   - For HTTP: manual allow required
   - Check camera not used by other app
   ```

2. **Face-API Models Not Downloaded**

   ```
   Cause: 350MB models not cached
   Solution:
   - First load takes 2-3 minutes
   - Models cached in IndexedDB
   - Check browser storage settings
   - Verify 500MB+ available space
   ```

3. **Lighting Issues**

   ```
   Solution:
   - Ensure good lighting (300+ lux)
   - Avoid backlighting
   - Remove glasses/sunglasses if recognition fails
   - Position face 30-40cm from camera
   ```

4. **Anti-Spoofing Detection**
   ```
   If "Liveness check failed":
   - Not a static image/video
   - Real biometric required
   - Subtle head movements help
   - No masks blocking face
   ```

---

## Section 4: Santé Connect OAuth Issues

### Problem: OAuth callback not working

**Symptoms:**

- Redirect to Santé Connect works
- After approval, redirect fails
- "Invalid state parameter"

**Solutions:**

1. **State Token Mismatch**

   ```
   Cause: CSRF protection token invalid
   Solution:
   - Verify state stored in secure cookie
   - Check state parameter in callback URL
   - Ensure cookies enabled in browser
   - Check cookie not expired (10 minutes)

   Debug:
   - Add logs in /api/wearables/santeconnect/callback
   - console.log('Stored state:', req.cookies.get('sc_state'));
   - console.log('URL state:', query.state);
   ```

2. **Redirect URI Mismatch**

   ```
   Cause: Callback URL doesn't match Santé Connect config
   Solution:
   SANTE_CONNECT_REDIRECT_URI must match EXACTLY:
   - Development: http://localhost:3000/api/wearables/santeconnect/callback
   - Production: https://yourdomain.com/api/wearables/santeconnect/callback
   - No trailing slash variations
   - Same protocol (http vs https)
   ```

3. **Invalid Client Credentials**

   ```
   Cause: Client ID/Secret incorrect
   Solution:
   1. Verify in Santé Connect dashboard:
      - SANTE_CONNECT_CLIENT_ID (correct format)
      - SANTE_CONNECT_CLIENT_SECRET (not exposed)

   2. Regenerate credentials if unsure:
      - Santé Connect Portal > Settings
      - Generate new credentials
      - Update .env immediately
   ```

4. **Token Exchange Failure**
   ```
   Cause: Authorization code already used or expired
   Solution:
   - Authorization code valid only 10 minutes
   - Each callback must exchange immediately
   - Don't retry with same code
   - User must restart flow if timeout
   ```

---

## Section 5: Database & Prisma Issues

### Problem: "Prisma Client not initialized"

```bash
# Solution:
npm run prisma:generate
npm run prisma:deploy

# Or manually:
npx prisma generate
npx prisma db push
```

### Problem: "User not found after authentication"

```
Solution:
1. Verify JWT contains userId
2. Check userId exists in database
3. Run diagnostic:
   npx prisma studio
   - Search Users table
   - Check user record exists

4. If missing, recreate:
   - Delete old token
   - Login again (creates user record)
```

---

## Section 6: Performance & Optimization

### High Latency Issues

**Problem: Slow AI responses**

```
Cause: Model latency or network issues
Diagnosis:
1. Check Groq Dashboard for latency stats
2. Monitor network tab (F12 > Network)
3. Compare response times:
   - Expected: 2-5 seconds
   - Timeout: 30 seconds

Solutions:
1. Use faster model: llama-3.1 vs 3.3
2. Reduce max_tokens parameter
3. Lower temperature (0.3-0.5)
4. Implement client-side caching
5. Use CDN for static content
```

### Memory Leaks

**Problem: App slows after extended use**

```
Solution:
1. Check DevTools > Memory tab
2. Clear IndexedDB (Face-API models)
3. Restart browser
4. Monitor conversation history size
5. Implement pagination for data
```

---

## Section 7: Logging & Debugging

### Enable Detailed Logging

```javascript
// In .env.local
DEBUG=medifollow:*
LOG_LEVEL=debug

// In your code
import { logger } from '@/lib/logger';

logger.debug('Authentication flow', {
  token: tokenExists,
  user: user?.id,
  role: user?.role,
  isActive: user?.isActive
});
```

### Check Application Logs

```bash
# Development logs
tail -f ~/.medifollow/logs/app.log

# Browser console (F12)
Open DevTools > Console tab

# Next.js terminal
Watch for [API] and [SERVER] prefixes

# Environment-specific log location:
VSCODE_TARGET_SESSION_LOG=c:\Users\Raouf\AppData\Roaming\Code\User\workspaceStorage\23a3df3d2bdfa4c5e2966c0735d1c952\GitHub.copilot-chat\debug-logs
```

---

## Section 8: Common Error Codes

| Code | Error               | Solution                                |
| ---- | ------------------- | --------------------------------------- |
| 401  | Not authenticated   | Check JWT token and cookies             |
| 403  | Forbidden           | Verify user role permissions            |
| 404  | Not found           | Check API endpoint path                 |
| 429  | Rate limit          | Wait and retry with exponential backoff |
| 500  | Server error        | Check logs, restart server              |
| 503  | Service unavailable | API provider down, retry later          |

---

## Section 9: Testing Endpoints

### Using cURL

```bash
# Test Authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@example.com","password":"password"}'

# Test Vital Parser
curl -X POST http://localhost:3000/api/patient/questionnaire \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "systolicBP":120,
    "diastolicBP":80,
    "heartRate":72,
    "temperature":37
  }'

# Test Chatbot
curl -X POST http://localhost:3000/api/patient/chatbot \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"I have chest pain"}'
```

### Using Postman

1. Import collection from `/docs/Postman_Collection.json`
2. Set environment variables:
   - `token`: Your JWT token
   - `api_url`: http://localhost:3000
3. Run each endpoint test
4. Check response times and data

---

## Section 10: Escalation Path

**Issue Unresolved?**

1. **Check Documentation**
   - Review AI_FEATURES_COMPREHENSIVE.md
   - Check implementation examples

2. **Enable Debug Mode**

   ```
   export DEBUG=medifollow:*
   npm run dev
   ```

3. **Collect Diagnostic Info**

   ```bash
   # System info
   uname -a
   node --version
   npm --version

   # Test services
   npm run test-ai-services

   # Export logs
   npm run export-logs
   ```

4. **Contact Support**
   - Email: support@medifollow.health
   - Include:
     - Error message and code
     - Diagnostic output
     - Steps to reproduce
     - Environment (dev/staging/prod)

---

## Section 11: Quick Fixes Checklist

- [ ] Restart development server
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Clear .next build directory: `rm -rf .next`
- [ ] Reinstall dependencies: `npm ci`
- [ ] Check all environment variables set: `npm run check-env`
- [ ] Verify network connectivity
- [ ] Check system clock is correct
- [ ] Review recent code changes
- [ ] Check Git status for uncommitted changes
- [ ] Look at recent API provider status pages

---

## Section 12: Success Indicators

✅ **You're good to go when:**

- All environment variables set
- npm run dev starts without errors
- Login endpoint returns 200 with token
- Face Recognition loads models
- Chatbot responds within 5 seconds
- Database queries complete within 1 second
- No 401/403 errors in healthy flow

**Questions?** Check the relevant documentation file or contact support.
