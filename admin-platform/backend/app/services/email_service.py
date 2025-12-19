"""
Email Service for Admin Platform
Handles sending emails for sub-admin invitations
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails"""
    
    @staticmethod
    async def send_invite_email(
        to_email: str,
        invite_link: str,
        permissions: dict,
        personal_message: Optional[str] = None
    ) -> bool:
        """
        Send invitation email to sub-admin
        """
        try:
            # If SMTP not configured, log and return False
            if not settings.SMTP_HOST or not settings.SMTP_USER:
                logger.warning(f"SMTP not configured. Would send invite email to {to_email} with link: {invite_link}")
                return False
            
            # Get permission labels
            permission_labels = []
            if permissions.get("productsManagement"):
                permission_labels.append("Products Management & Suppliers")
            if permissions.get("customersFeedbacks"):
                permission_labels.append("Customers, Feedbacks & Contact")
            if permissions.get("finance"):
                permission_labels.append("Finance")
            
            permissions_text = ", ".join(permission_labels) if permission_labels else "No specific permissions"
            
            # Create email
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Invitation to TripsAdora Admin Platform'
            msg['From'] = settings.SMTP_USER
            msg['To'] = to_email
            
            # Email body
            html_body = f"""
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #3B69E2;">You've been invited to TripsAdora Admin Platform</h2>
                  
                  <p>Hello,</p>
                  
                  <p>You have been granted access to the TripsAdora Admin Platform with the following permissions:</p>
                  
                  <ul style="list-style-type: none; padding-left: 0;">
                    <li style="margin: 10px 0;">✓ {permissions_text}</li>
                  </ul>
                  
                  {f'<p><strong>Message from Admin:</strong> {personal_message}</p>' if personal_message else ''}
                  
                  <p>Click the button below to access the platform:</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="{invite_link}" 
                       style="background-color: #3B69E2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                      Access Admin Platform
                    </a>
                  </div>
                  
                  <p style="font-size: 12px; color: #666;">Or copy and paste this link into your browser:</p>
                  <p style="font-size: 12px; color: #666; word-break: break-all;">{invite_link}</p>
                  
                  <p style="font-size: 12px; color: #666; margin-top: 30px;">
                    This invitation link will expire in 7 days.
                  </p>
                  
                  <p style="font-size: 12px; color: #666;">
                    If you did not expect this invitation, please ignore this email.
                  </p>
                </div>
              </body>
            </html>
            """
            
            text_body = f"""
            You've been invited to TripsAdora Admin Platform
            
            You have been granted access with the following permissions:
            - {permissions_text}
            
            {f'Message from Admin: {personal_message}' if personal_message else ''}
            
            Click this link to access the platform:
            {invite_link}
            
            This invitation link will expire in 7 days.
            
            If you did not expect this invitation, please ignore this email.
            """
            
            part1 = MIMEText(text_body, 'plain')
            part2 = MIMEText(html_body, 'html')
            
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT or 587) as server:
                if settings.SMTP_PORT == 465:
                    server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
                else:
                    server.starttls()
                
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                
                server.send_message(msg)
            
            logger.info(f"Invitation email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send invitation email to {to_email}: {e}", exc_info=True)
            return False

