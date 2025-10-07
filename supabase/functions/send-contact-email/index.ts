const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { firstName, lastName, email, subject, message }: ContactFormData = await req.json();

    console.log("Processing contact form submission:", { firstName, lastName, email, subject });

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('Resend API key not configured in environment variables.');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Server configuration error: Resend API key is missing." 
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Send email using Resend API
    const emailData = {
      from: 'The Sports Chronicle <thesportschronicle@outlook.com>', // Updated 'from' address
      to: ['contact@thesportschronicle.com'],
      reply_to: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Sent from The Sports Chronicle contact form</em></p>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${firstName} ${lastName}
        Email: ${email}
        Subject: ${subject}
        
        Message:
        ${message}
        
        ---
        Sent from The Sports Chronicle contact form
      `
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json(); // Attempt to parse error as JSON
      console.error('Resend API error:', errorData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorData.message || `Failed to send email: ${response.status}` 
        }),
        {
          status: response.status, // Use the actual status from Resend
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contact form submitted successfully",
        emailId: result.id
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error processing contact form:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to process contact form" 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});