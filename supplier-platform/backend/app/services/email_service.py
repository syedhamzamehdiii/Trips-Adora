import logging
from typing import Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings

logger = logging.getLogger(__name__)

# Email configuration
mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER or "",
    MAIL_PASSWORD=settings.SMTP_PASSWORD or "",
    MAIL_FROM=settings.SMTP_USER or "noreply@tripsadora.com",
    MAIL_PORT=settings.SMTP_PORT or 587,
    MAIL_SERVER=settings.SMTP_HOST or "smtp.gmail.com",
    MAIL_FROM_NAME="TripsAdora Supplier Platform",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

fastmail = FastMail(mail_config)


async def send_invitation_email(
    email: str,
    invitation_link: str,
    supplier_code: str,
    inviter_name: str,
    permissions: dict
) -> bool:
    """
    Send invitation email to grant supplier access.
    Returns True if email was sent successfully, False otherwise.
    """
    try:
        # Build permissions list
        permission_list = []
        if permissions.get("productsManagement"):
            permission_list.append("Products Management")
        if permissions.get("customersFeedbacks"):
            permission_list.append("Customers & Feedbacks")
        if permissions.get("finance"):
            permission_list.append("Finance")
        
        permissions_text = ", ".join(permission_list) if permission_list else "No specific permissions"
        
        # Email HTML template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #3B69E2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; padding: 12px 30px; background-color: #3B69E2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Supplier Access Invitation</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p><strong>{inviter_name}</strong> has invited you to access their supplier account on TripsAdora.</p>
                    <p><strong>Supplier Account:</strong> {supplier_code}</p>
                    <p><strong>Your Permissions:</strong> {permissions_text}</p>
                    <p>Click the button below to accept the invitation and access the supplier dashboard:</p>
                    <div style="text-align: center;">
                        <a href="{invitation_link}" class="button">Accept Invitation & Access Dashboard</a>
                    </div>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">
                        This link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                </div>
                <div class="footer">
                    <p>© 2025 TripsAdora. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
        Supplier Access Invitation
        
        Hello,
        
        {inviter_name} has invited you to access their supplier account on TripsAdora.
        
        Supplier Account: {supplier_code}
        Your Permissions: {permissions_text}
        
        Click this link to accept the invitation:
        {invitation_link}
        
        This link will expire in 7 days.
        
        © 2025 TripsAdora. All rights reserved.
        """
        
        message = MessageSchema(
            subject="You've been invited to access a supplier account - TripsAdora",
            recipients=[email],
            body=html_content,
            subtype="html"
        )
        
        # Only send email if SMTP is configured
        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            await fastmail.send_message(message)
            logger.info(f"Invitation email sent to {email}")
            return True
        else:
            # In development, just log the link
            logger.warning(f"SMTP not configured. Invitation link for {email}: {invitation_link}")
            logger.warning("In production, configure SMTP settings to send emails")
            return False
            
    except Exception as e:
        logger.error(f"Failed to send invitation email to {email}: {e}")
        return False
