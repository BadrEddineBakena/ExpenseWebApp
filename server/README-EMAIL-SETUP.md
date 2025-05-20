# Email Configuration for Password Reset

This guide explains how to set up the email service for password reset functionality in ExpenseApp.

## Configuration Options

### 1. For Testing (Using Ethereal Email)

[Ethereal Email](https://ethereal.email/) provides free, disposable email accounts for testing. This is perfect for development:

1. Go to https://ethereal.email/ and click "Create Ethereal Account"
2. It will generate a temporary email account with SMTP credentials
3. Add these credentials to your `.env` file

Example `.env` configuration using Ethereal:

```
# Email Configuration
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ethereal-email@ethereal.email
EMAIL_PASSWORD=your-ethereal-password
EMAIL_FROM=ExpenseApp <no-reply@expenseapp.com>
```

With Ethereal, emails won't actually be delivered to real inboxes. Instead, you'll see a preview URL in your console when an email is "sent", allowing you to view what the email would look like.

### 2. For Production (Using Real Email Services)

For production, you can use various email services:

#### Gmail

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password  # Use an App Password, not your regular password
EMAIL_FROM=ExpenseApp <your-gmail@gmail.com>
```

Note: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password" specifically for this application

#### SendGrid (Free tier: 100 emails/day)

```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey  # This is literally "apikey", not your actual API key
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=ExpenseApp <your-verified-sender@yourdomain.com>
```

#### Mailgun (Free tier: 5,000 emails/month for 3 months)

```
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@your-mailgun-domain
EMAIL_PASSWORD=your-mailgun-password
EMAIL_FROM=ExpenseApp <no-reply@your-mailgun-domain>
```

## Adding Environment Variables

Add the following to your existing `.env` file:

```
# Frontend URL (for reset password links)
FRONTEND_URL=http://localhost:3000  # Change this in production

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=ExpenseApp <no-reply@expenseapp.com>
```

## Testing the Setup

1. Make sure you've installed nodemailer: `npm install nodemailer`
2. Set up your environment variables in `.env`
3. Try to request a password reset by sending a POST request to `/api/users/forgot-password` with your email
4. Check the console logs for the email preview URL (if using Ethereal) or check your inbox (if using a real email service)

## Troubleshooting

- If using Gmail, make sure you're using an App Password, not your regular account password
- Some email providers block emails sent from unfamiliar IPs or servers
- Check your spam folder if you're not seeing the emails
- Verify your SMTP settings are correct for your email provider 