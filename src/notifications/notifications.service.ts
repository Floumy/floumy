import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ServerClient } from "postmark";

@Injectable()
export class NotificationsService {


  constructor(
    @Inject("POSTMARK_CLIENT") private postmarkClient: ServerClient,
    private configService: ConfigService) {
  }


  async sendActivationEmail(name: string, email: string, activationToken: string) {
    await this.postmarkClient.sendEmail({
      From: this.configService.get("mail.user"),
      To: email,
      Subject: "Activate your account",
      HtmlBody: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Floumy</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            a {
                display: inline-block;
                background: #007bff;
                color: #ffffff !important;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            h2 {
                color: #007bff;
            }
        </style>
        </head>
        <body>
        <div class="container">
            <h2>Welcome Aboard! 🎉</h2>
            <p>Dear Silviu,</p>
            <p>I'm Alex, the founder of Floumy, thrilled to welcome you to our product management platform. You're about to transform how your projects come to life.</p>
            <p><b>Activate Your Account Now:</b></p>
            <p>To jumpstart your journey with Floumy, click below:</p>
            <p><a href="${this.configService.get("app.url")}/auth/activation?token=${activationToken}">Activate My Account</a></p>
            <p>Here’s why you’ll love Floumy:</p>
            <ul>
                <li><b>Collaboration Made Easy:</b> Streamlined teamwork awaits.</li>
                <li><b>Vision to Victory:</b> Bring your ideas to life with our intuitive tools.</li>
                <li><b>Support That Cares:</b> We’re here to help every step of the way.</li>
            </ul>
            <p>Don't let your projects just dream about success. Let's make them a reality. If you have any questions or need assistance, I'm here for you.</p>
            <p>Welcome to the Floumy family! Let's create, innovate, and elevate together.</p>
            <p>Best Regards,<br>Alex<br></p>
        </div>
        </body>
        </html>
      `,
      TextBody: `
        Welcome Aboard! 🎉

        Dear Silviu,
        
        I'm Alex, the founder of Floumy, thrilled to welcome you to our product management platform. You're about to transform how your projects come to life.
        
        Activate Your Account Now:
        
        To jumpstart your journey with Floumy, use the activation link below:
        
        ${this.configService.get("app.url")}/auth/activation?token=${activationToken}
        
        Here’s why you’ll love Floumy:
        
        Collaboration Made Easy: Streamlined teamwork awaits.
        Vision to Victory: Bring your ideas to life with our intuitive tools.
        Support That Cares: We’re here to help every step of the way.
        Don't let your projects just dream about success. Let's make them a reality. If you have any questions or need assistance, I'm here for you.
        
        Welcome to the Floumy family! Let's create, innovate, and elevate together.
        
        Best Regards,
        Alex`,
      MessageStream: "outbound"
    });
  }
}
