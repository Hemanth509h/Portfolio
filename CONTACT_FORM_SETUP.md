# Contact Form Setup Guide

## Security Improvements Implemented

### ✅ Issues Fixed

1. **Removed Insecure Endpoint**: The `/api/contacts` GET endpoint that exposed all contact submissions has been removed for security.

2. **Enhanced Validation**: Added comprehensive validation to the contact form schema:
   - Name: 1-100 characters, required
   - Email: Valid email format, max 254 characters, lowercased
   - Subject: 1-200 characters, required
   - Message: 10-5000 characters, required

3. **Rate Limiting**: Implemented IP-based rate limiting (5 submissions per hour per IP address)

4. **Email Notifications**: Added nodemailer integration for email notifications

## Email Configuration

To enable email notifications, set these environment variables:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NOTIFICATION_EMAIL=where-you-want-notifications@example.com
```

### For Gmail:
1. Enable 2-factor authentication
2. Generate an "App Password" in your Google Account settings
3. Use the app password as `SMTP_PASS`

### For Other Providers:
- **Outlook/Hotmail**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587` 
- **Custom SMTP**: Use your provider's settings

## Testing the Contact Form

1. Navigate to the contact form section on your portfolio
2. Fill out all required fields (name, email, subject, message)
3. Submit the form
4. Check for success/error messages
5. If email is configured, you should receive a notification

## Security Features

- **Input Sanitization**: All fields are trimmed and validated
- **Rate Limiting**: Prevents spam (5 submissions/hour per IP)
- **No Data Exposure**: Contact data is not accessible via API
- **Error Handling**: Detailed validation errors returned to user
- **Graceful Degradation**: Form works even if email service fails

## Production Deployment

For production use:
1. Set up proper SMTP service (Gmail, SendGrid, AWS SES, etc.)
2. Configure environment variables securely
3. Consider additional rate limiting with Redis for multiple server instances
4. Monitor email delivery and error rates