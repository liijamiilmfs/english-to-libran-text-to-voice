# Security Documentation

## 🚨 CRITICAL SECURITY NOTICE

This application exposes several API endpoints that require proper authentication and authorization in production environments.

## 🔒 Secured Endpoints

### Admin Endpoints (Require X-Admin-Secret Header)
- `/api/admin/dictionary` - Dictionary management
- `/api/admin/dictionary/bulk` - Bulk dictionary operations
- `/api/admin/reload` - System reload functionality

### Sensitive API Endpoints (Require X-API-Secret Header)
- `/api/unknown-tokens` - Unknown token logging and management
- `/api/tts-cache` - TTS cache management
- `/api/metrics` - System metrics and monitoring

### Public Endpoints (Rate Limited Only)
- `/api/translate` - Translation service
- `/api/speak` - Text-to-speech generation
- `/api/phrases` - Phrase management

## 🔧 Environment Configuration

### Development Mode
- All authentication is bypassed for local development
- Rate limiting is still enforced
- Logs show authentication bypass messages

### Production Mode
- **REQUIRED**: Set `ADMIN_SECRET` environment variable
- **REQUIRED**: Set `API_SECRET` environment variable
- All endpoints require proper authentication headers
- Rate limiting: 100 requests per 15-minute window per IP

## 🛡️ Security Headers

### Admin Authentication
```http
X-Admin-Secret: your-admin-secret-here
```

### API Authentication
```http
X-API-Secret: your-api-secret-here
```

## 📊 Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Response**: 429 Too Many Requests
- **Retry-After**: 900 seconds (15 minutes)

## 🚨 Security Features

1. **Authentication**: All sensitive endpoints require secrets
2. **Rate Limiting**: Prevents abuse and DoS attacks
3. **IP Logging**: All requests are logged with IP addresses
4. **Environment Detection**: Automatic security level based on NODE_ENV
5. **Error Handling**: Secure error responses without information leakage

## 🔍 Monitoring

All authentication attempts (successful and failed) are logged with:
- IP address
- User agent
- Timestamp
- Request details
- Environment context

## ⚠️ Production Deployment Checklist

- [ ] Set `ADMIN_SECRET` environment variable
- [ ] Set `API_SECRET` environment variable  
- [ ] Set `NODE_ENV=production`
- [ ] Verify all admin endpoints return 401 without auth
- [ ] Test rate limiting functionality
- [ ] Monitor authentication logs
- [ ] Use HTTPS in production
- [ ] Consider using Redis for distributed rate limiting

## 🚫 What Was Previously Exposed (FIXED)

Before this security update, the following endpoints were completely exposed:
- Dictionary management and bulk operations
- TTS cache clearing and inspection
- Unknown token logging and export
- System metrics and performance data
- Dictionary reload functionality

**These are now properly secured and require authentication.**

## 📝 Security Contact

For security issues, please:
1. Do not create public issues
2. Contact the maintainer directly
3. Include detailed information about the vulnerability
