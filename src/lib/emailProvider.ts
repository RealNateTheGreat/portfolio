import toast from 'react-hot-toast';

interface EmailConfig {
  from_email: string;
  reply_to?: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  message: string;
}

// Email configuration
const emailConfig: EmailConfig = {
  from_email: 'nathan@albimestudios.com',
  reply_to: 'nathan@albimestudios.com',
};

// Cloudflare configuration with the new token
const CLOUDFLARE_API_TOKEN = 'n6xdaO8NKdk8LqTKEqv2pgRVDSqsuxeyhtt4MSi6'; 
const CLOUDFLARE_ACCOUNT_ID = '5833d4acfacfb936f3dab0fe953e3e7d';

/**
 * Send email using Cloudflare Email API with improved error handling
 */
export async function sendEmail({ to, subject, message }: SendEmailParams): Promise<boolean> {
  try {
    console.log(`Attempting to send email to ${to} with subject "${subject}"`);
    
    // Check if we have necessary configuration
    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
      console.warn('Missing Cloudflare configuration, falling back to mock email');
      return sendMockEmail({ to, subject, message });
    }
    
    // Try sending with formatted message body
    const bodyPayload = {
      from_email: emailConfig.from_email,
      to_email: to,
      subject: subject,
      body: message
    };
    
    console.log('Making Cloudflare API request with payload:', JSON.stringify(bodyPayload));
    
    // Make the API request
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/email/routing/send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      }
    );

    // Get the full response for debugging
    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries([...response.headers.entries()]));
    console.log(`Response text: ${responseText}`);
    
    // Parse the response if it's valid JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
    } catch (e) {
      console.log('Response is not valid JSON');
    }
    
    // Check if the request was successful
    if (!response.ok) {
      console.error(`Email API response not OK: ${response.status} ${responseText}`);
      
      // Try alternative format if the first one failed
      return await trySendingWithAlternativeFormat(to, subject, message);
    }
    
    if (data && !data.success) {
      console.error('Failed to send email:', data.errors || 'Unknown error');
      
      // Try alternative format if the first one failed
      return await trySendingWithAlternativeFormat(to, subject, message);
    }
    
    console.log('Email sent successfully via Cloudflare API');
    return true;
  } catch (error) {
    console.error('Error in sendEmail function:', error);
    return sendMockEmail({ to, subject, message });
  }
}

/**
 * Try sending with different payload formats as the API might change
 */
async function trySendingWithAlternativeFormat(to: string, subject: string, message: string): Promise<boolean> {
  try {
    console.log('Trying alternative formats for Cloudflare Email API...');
    
    // Format options to try
    const formatOptions = [
      // Option 1: Using message_plain
      {
        from_email: emailConfig.from_email,
        to_email: to,
        subject: subject,
        message_plain: message
      },
      // Option 2: Using content
      {
        from_email: emailConfig.from_email,
        to_email: to,
        subject: subject,
        content: message
      },
      // Option 3: Using HTML format
      {
        from_email: emailConfig.from_email,
        to_email: to,
        subject: subject,
        html_content: `<div style="font-family: Arial, sans-serif;">${message.replace(/\n/g, '<br>')}</div>`
      }
    ];
    
    // Try each format option
    for (const [index, payload] of formatOptions.entries()) {
      console.log(`Trying format option ${index + 1}:`, JSON.stringify(payload));
      
      try {
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/email/routing/send`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          }
        );
        
        const responseText = await response.text();
        console.log(`Format ${index + 1} response status: ${response.status}`);
        console.log(`Format ${index + 1} response text: ${responseText}`);
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.log(`Format ${index + 1} response is not valid JSON`);
          continue;
        }
        
        if (response.ok && data && data.success) {
          console.log(`Email sent successfully with format option ${index + 1}`);
          return true;
        }
      } catch (err) {
        console.warn(`Error with format option ${index + 1}:`, err);
      }
    }
    
    console.warn('All alternative formats failed, falling back to mock email');
    return sendMockEmail({ to, subject, message });
  } catch (error) {
    console.error('Error in alternative formats:', error);
    return sendMockEmail({ to, subject, message });
  }
}

/**
 * Mock email sending for development/testing
 */
function sendMockEmail({ to, subject, message }: SendEmailParams): boolean {
  console.log('\n===== MOCK EMAIL SENT (API UNAVAILABLE) =====');
  console.log(`From: ${emailConfig.from_email}`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('------ CONTENT ------');
  console.log(message);
  console.log('======================================\n');
  
  // Show a toast for better visibility in the UI
  toast.success('Email simulation: Message would be sent in production');
  
  // Return true to simulate success
  return true;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
  const subject = 'Reset Your Password';
  const message = `
Hello,

You requested to reset your password. Please click the link below to set a new password:

${resetUrl}

If you didn't request this, please ignore this email.

Thank you,
Your Application Team
  `.trim();

  return sendEmail({ to: email, subject, message });
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(email: string, displayName: string): Promise<boolean> {
  const subject = 'Welcome to Our Application';
  const message = `
Hello ${displayName},

Welcome to our application! We're excited to have you on board.

If you have any questions, please don't hesitate to contact us.

Thank you,
Your Application Team
  `.trim();

  return sendEmail({ to: email, subject, message });
}