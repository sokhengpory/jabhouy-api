import { OpenAPIHono } from '@hono/zod-openapi';
import type { AppBindings } from '~/lib/type';

export const privacyRouter = new OpenAPIHono<AppBindings>();

const privacyHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Privacy Policy - Jabhouy</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 { 
            color: #1a1a1a;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        h2 { 
            color: #2c3e50;
            margin-top: 30px;
        }
        strong { color: #2c3e50; }
        ul { 
            padding-left: 20px;
            margin-bottom: 20px;
        }
        li { margin-bottom: 8px; }
        @media (max-width: 600px) {
            body { padding: 15px; }
            h1 { font-size: 24px; }
            h2 { font-size: 20px; }
        }
    </style>
</head>
<body>
    <h1>Privacy Policy for Jabhouy</h1>

    <p><strong>Effective Date:</strong> March 30, 2025</p>

    <p>Welcome to Jabhouy! This Privacy Policy explains how Jabhouy ("we," "us," or "our") collects, uses, and protects your information when you use our mobile application ("App") available on the Google Play Store. We are committed to safeguarding your privacy and ensuring transparency about our practices.</p>

    <h2>1. Information We Collect</h2>
    <p>To use Jabhouy, users are required to create an account. We collect the following information during this process:</p>
    <ul>
        <li><strong>Personal Information:</strong> Email address and username (or other account credentials you provide).</li>
        <li><strong>No Additional Data:</strong> We do not collect usage statistics, device information, or any other data beyond what is necessary for account creation and login.</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <p>We use the information we collect to:</p>
    <ul>
        <li>Create and manage your Jabhouy account.</li>
        <li>Allow you to log in and access the App's features.</li>
        <li>Communicate with you about your account (e.g., password resets), if necessary.</li>
    </ul>

    <h2>3. How We Share Your Information</h2>
    <p>We do not sell, trade, or share your personal information with third parties, except in the following cases:</p>
    <ul>
        <li><strong>Service Providers:</strong> We may use trusted third-party services (e.g., hosting providers) to store account data, but only to the extent necessary to operate the App.</li>
        <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights, safety, or property.</li>
    </ul>

    <h2>4. Data Storage and Security</h2>
    <p>Your account information is stored securely using industry-standard measures to protect it from unauthorized access, loss, or misuse. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>

    <h2>5. Third-Party Links or Services</h2>
    <p>Jabhouy does not contain links to third-party websites or services.</p>

    <h2>6. Your Choices</h2>
    <p>You can:</p>
    <ul>
        <li>Stop using the App at any time.</li>
        <li>Request deletion of your account and associated data by contacting us at the email below. Upon deletion, all personal information tied to your account will be removed.</li>
    </ul>

    <h2>7. Changes to This Privacy Policy</h2>
    <p>We may update this Privacy Policy from time to time. Any changes will be reflected with a revised "Effective Date" at the top of this page. We encourage you to review this policy periodically.</p>

    <h2>8. Contact Us</h2>
    <p>If you have any questions or concerns about this Privacy Policy, or wish to delete your account, please contact us at:</p>
    <p><strong>Email:</strong> ck.punlork@gmail.com</p>
</body>
</html>`;

privacyRouter.get('/', (c) => {
	return c.html(privacyHTML);
});
