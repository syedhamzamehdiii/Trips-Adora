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


async def send_booking_diversion_email(
    recipient_email: str,
    recipient_name: str,
    booking_reference: str,
    booking_details: dict,
    sender_name: str,
    sender_email: str,
    cancellation_reason: Optional[str] = None
) -> bool:
    """
    Send email to another supplier requesting they handle a booking cancellation.
    Returns True if email was sent successfully, False otherwise.
    """
    try:
        booking_title = booking_details.get("title") or booking_details.get("tour_name") or "Booking"
        customer_name = booking_details.get("customer_name") or "Customer"
        booking_date = booking_details.get("start_date") or "N/A"
        
        # Email HTML template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #1d236b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .booking-details {{ background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1d236b; }}
                .button {{ display: inline-block; padding: 12px 30px; background-color: #1d236b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                .reason-box {{ background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Booking Diversion Request</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>{recipient_name}</strong>,</p>
                    <p><strong>{sender_name}</strong> ({sender_email}) has requested that you handle the cancellation of a booking.</p>
                    
                    <div class="booking-details">
                        <h3 style="margin-top: 0; color: #1d236b;">Booking Details</h3>
                        <p><strong>Reference Code:</strong> {booking_reference}</p>
                        <p><strong>Tour/Product:</strong> {booking_title}</p>
                        <p><strong>Customer:</strong> {customer_name}</p>
                        <p><strong>Booking Date:</strong> {booking_date}</p>
                    </div>
                    
                    {f'<div class="reason-box"><p><strong>Reason for Diversion:</strong></p><p>{cancellation_reason}</p></div>' if cancellation_reason else ''}
                    
                    <p>Please review this booking and provide a cancellation reason if needed. You can access the booking details in your supplier dashboard.</p>
                    
                    <p style="margin-top: 20px;">Thank you for your assistance.</p>
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
        Booking Diversion Request
        
        Hello {recipient_name},
        
        {sender_name} ({sender_email}) has requested that you handle the cancellation of a booking.
        
        Booking Details:
        - Reference Code: {booking_reference}
        - Tour/Product: {booking_title}
        - Customer: {customer_name}
        - Booking Date: {booking_date}
        
        {f'Reason for Diversion: {cancellation_reason}' if cancellation_reason else ''}
        
        Please review this booking and provide a cancellation reason if needed.
        
        Thank you for your assistance.
        
        © 2025 TripsAdora. All rights reserved.
        """
        
        message = MessageSchema(
            subject=f"Booking Diversion Request - {booking_reference}",
            recipients=[recipient_email],
            body=html_content,
            subtype="html"
        )
        
        # Only send email if SMTP is configured
        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            await fastmail.send_message(message)
            logger.info(f"Booking diversion email sent to {recipient_email}")
            return True
        else:
            logger.warning(f"SMTP not configured. Booking diversion email for {recipient_email} would be sent with booking {booking_reference}")
            return False
            
    except Exception as e:
        logger.error(f"Failed to send booking diversion email to {recipient_email}: {e}")
        return False


async def send_booking_cancellation_email(
    customer_email: str,
    customer_name: str,
    booking_reference: str,
    booking_details: dict,
    supplier_name: str,
    cancellation_reason: Optional[str] = None
) -> bool:
    """
    Send email to customer notifying them that their booking has been cancelled.
    Returns True if email was sent successfully, False otherwise.
    """
    try:
        booking_title = booking_details.get("title") or booking_details.get("tour_name") or "Your Booking"
        booking_date = booking_details.get("start_date") or "N/A"
        total_amount = booking_details.get("total_amount", 0)
        currency = booking_details.get("currency", "USD")
        
        # Format date
        try:
            from datetime import datetime
            if booking_date and booking_date != "N/A":
                # Handle ISO format dates
                if "T" in str(booking_date):
                    date_str = str(booking_date).replace("Z", "+00:00")
                    if "+" not in date_str and "-" in date_str:
                        # Try parsing without timezone
                        date_str = date_str.split("T")[0]
                    try:
                        date_obj = datetime.fromisoformat(date_str)
                    except:
                        # Fallback to parsing just the date part
                        date_obj = datetime.strptime(date_str.split("T")[0], "%Y-%m-%d")
                    formatted_date = date_obj.strftime("%B %d, %Y")
                else:
                    formatted_date = booking_date
            else:
                formatted_date = booking_date
        except Exception as date_err:
            logger.warning(f"Error formatting booking date: {date_err}")
            formatted_date = booking_date
        
        # Format currency
        try:
            formatted_amount = f"{currency} {total_amount:,.2f}"
        except:
            formatted_amount = f"{currency} {total_amount}"
        
        # Email HTML template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .booking-details {{ background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545; }}
                .button {{ display: inline-block; padding: 12px 30px; background-color: #1d236b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                .reason-box {{ background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }}
                .info-box {{ background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #1d236b; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Booking Cancellation Notice</h1>
                </div>
                <div class="content">
                    <p>Dear <strong>{customer_name}</strong>,</p>
                    <p>We regret to inform you that your booking has been cancelled by the supplier.</p>
                    
                    <div class="booking-details">
                        <h3 style="margin-top: 0; color: #dc3545;">Booking Details</h3>
                        <p><strong>Reference Code:</strong> {booking_reference}</p>
                        <p><strong>Tour/Product:</strong> {booking_title}</p>
                        <p><strong>Booking Date:</strong> {formatted_date}</p>
                        <p><strong>Total Amount:</strong> {formatted_amount}</p>
                    </div>
                    
                    {f'<div class="reason-box"><p><strong>Cancellation Reason:</strong></p><p>{cancellation_reason}</p></div>' if cancellation_reason else ''}
                    
                    <div class="info-box">
                        <p><strong>What happens next?</strong></p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>If you have already paid, a refund will be processed according to our cancellation policy.</li>
                            <li>You will receive a separate email confirmation once the refund has been processed.</li>
                            <li>If you have any questions or concerns, please contact our customer support team.</li>
                        </ul>
                    </div>
                    
                    <p style="margin-top: 20px;">We apologize for any inconvenience this may cause.</p>
                    
                    <p>Best regards,<br>
                    <strong>{supplier_name}</strong><br>
                    TripsAdora Team</p>
                </div>
                <div class="footer">
                    <p>© 2025 TripsAdora. All rights reserved.</p>
                    <p>This is an automated notification. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
        Booking Cancellation Notice
        
        Dear {customer_name},
        
        We regret to inform you that your booking has been cancelled by the supplier.
        
        Booking Details:
        - Reference Code: {booking_reference}
        - Tour/Product: {booking_title}
        - Booking Date: {formatted_date}
        - Total Amount: {formatted_amount}
        
        {f'Cancellation Reason: {cancellation_reason}' if cancellation_reason else ''}
        
        What happens next?
        - If you have already paid, a refund will be processed according to our cancellation policy.
        - You will receive a separate email confirmation once the refund has been processed.
        - If you have any questions or concerns, please contact our customer support team.
        
        We apologize for any inconvenience this may cause.
        
        Best regards,
        {supplier_name}
        TripsAdora Team
        
        © 2025 TripsAdora. All rights reserved.
        This is an automated notification. Please do not reply to this email.
        """
        
        message = MessageSchema(
            subject=f"Booking Cancellation - {booking_reference}",
            recipients=[customer_email],
            body=html_content,
            subtype="html"
        )
        
        # Only send email if SMTP is configured
        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            await fastmail.send_message(message)
            logger.info(f"Booking cancellation email sent to customer {customer_email}")
            return True
        else:
            logger.warning(f"SMTP not configured. Booking cancellation email for {customer_email} would be sent with booking {booking_reference}")
            return False
            
    except Exception as e:
        logger.error(f"Failed to send booking cancellation email to {customer_email}: {e}")
        return False


async def send_supplier_to_customer_email(
    customer_email: str,
    customer_name: str,
    supplier_email: str,
    supplier_name: str,
    subject: str,
    message: str,
    booking_reference: Optional[str] = None
) -> bool:
    """
    Send email from supplier to customer using the supplier's authenticated email.
    Returns True if email was sent successfully, False otherwise.
    """
    try:
        # Email HTML template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #1d236b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .message-box {{ background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1d236b; white-space: pre-wrap; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Message from Your Supplier</h1>
                </div>
                <div class="content">
                    <p>Dear <strong>{customer_name}</strong>,</p>
                    <p>You have received a message from <strong>{supplier_name}</strong> ({supplier_email}){f' regarding booking {booking_reference}' if booking_reference else ''}.</p>
                    
                    <div class="message-box">
                        <p><strong>Subject:</strong> {subject}</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                        <p>{message}</p>
                    </div>
                    
                    <p style="margin-top: 20px;">Best regards,<br>
                    <strong>{supplier_name}</strong><br>
                    TripsAdora Supplier</p>
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
        Message from Your Supplier
        
        Dear {customer_name},
        
        You have received a message from {supplier_name} ({supplier_email}){f' regarding booking {booking_reference}' if booking_reference else ''}.
        
        Subject: {subject}
        
        {message}
        
        Best regards,
        {supplier_name}
        TripsAdora Supplier
        
        © 2025 TripsAdora. All rights reserved.
        """
        
        # Create message with supplier's email as sender
        # Note: FastMail uses the configured MAIL_FROM by default, but we set reply_to to supplier's email
        # The email will be sent from the configured SMTP account but with supplier's email as reply-to
        message_obj = MessageSchema(
            subject=subject,
            recipients=[customer_email],
            body=html_content,
            subtype="html",
            # Use supplier's email as reply-to so customer can reply directly
            reply_to=supplier_email
        )
        
        # Only send email if SMTP is configured
        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            try:
                await fastmail.send_message(message_obj)
                logger.info(f"Email sent from supplier {supplier_email} to customer {customer_email} with subject: {subject}")
                return True
            except Exception as send_error:
                logger.error(f"Error sending email via SMTP: {send_error}")
                return False
        else:
            logger.warning(f"SMTP not configured. Email from {supplier_email} to {customer_email} would be sent with subject: {subject}")
            return False
            
    except Exception as e:
        logger.error(f"Failed to send email from supplier {supplier_email} to customer {customer_email}: {e}")
        return False
