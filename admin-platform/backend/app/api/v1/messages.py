from fastapi import APIRouter, Query, Path, HTTPException
import logging
from typing import Optional

from app.services.message_service import AdminMessageService
from app.schemas.message import (
    AdminSendMessageRequest,
    AdminMessageResponse,
    AdminConversationResponse,
    AdminConversationListResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/send", response_model=AdminMessageResponse)
async def send_message(payload: AdminSendMessageRequest):
    """
    Send a message from admin to a customer or supplier.
    """
    try:
        msg = await AdminMessageService.send_message(
            recipient_type=payload.recipient_type,
            recipient_id=payload.recipient_id,
            message=payload.message,
            admin_name=payload.admin_name,
        )
        return AdminMessageResponse(
            id=str(msg.get("id") or msg.get("_id") or ""),
            conversation_id=msg.get("conversation_id"),
            sender_type=msg.get("sender_type", "admin"),
            sender_id=msg.get("sender_id", "admin"),
            sender_name=msg.get("sender_name", "Admin"),
            recipient_id=msg.get("recipient_id", ""),
            product_id=msg.get("product_id"),
            product_title=msg.get("product_title"),
            subject=msg.get("subject"),
            message=msg.get("message", ""),
            message_type=msg.get("message_type", "support"),
            reply_to_message_id=msg.get("reply_to_message_id"),
            reply_preview=msg.get("reply_preview"),
            is_read=msg.get("is_read", False),
            attachments=msg.get("attachments", []),
            created_at=msg.get("created_at"),
        )
    except Exception as exc:
        logger.error(f"Failed to send admin message: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/conversations", response_model=AdminConversationListResponse)
async def list_conversations(
    participant_type: Optional[str] = Query(None, description="Filter to 'customer' or 'supplier'"),
    search: Optional[str] = Query(None, description="Search by participant name or id"),
):
    try:
        conversations = await AdminMessageService.get_conversations(participant_type=participant_type, search=search)

        convo_responses = []
        for conv in conversations:
            last_msg = conv.get("last_message")
            last_response = None
            if last_msg:
                last_response = AdminMessageResponse(
                    id=last_msg.get("id"),
                    conversation_id=conv.get("conversation_id"),
                    sender_type=last_msg.get("sender_type", "admin"),
                    sender_id=last_msg.get("sender_id", "admin"),
                    sender_name=last_msg.get("sender_name", "Admin"),
                    recipient_id=last_msg.get("recipient_id", ""),
                    product_id=last_msg.get("product_id"),
                    product_title=last_msg.get("product_title"),
                    subject=last_msg.get("subject"),
                    message=last_msg.get("message", ""),
                    message_type=last_msg.get("message_type", "support"),
                    reply_to_message_id=last_msg.get("reply_to_message_id"),
                    reply_preview=last_msg.get("reply_preview"),
                    is_read=last_msg.get("is_read", False),
                    attachments=last_msg.get("attachments", []),
                    created_at=last_msg.get("created_at"),
                )

            convo_responses.append(
                AdminConversationResponse(
                    conversation_id=conv.get("conversation_id"),
                    other_party_id=conv.get("other_party_id"),
                    other_party_name=conv.get("other_party_name"),
                    other_party_type=conv.get("other_party_type"),
                    product_id=conv.get("product_id"),
                    product_title=conv.get("product_title"),
                    last_message=last_response,
                    unread_count=conv.get("unread_count", 0),
                    created_at=conv.get("created_at"),
                    updated_at=conv.get("updated_at"),
                )
            )

        return AdminConversationListResponse(conversations=convo_responses, total=len(convo_responses))
    except Exception as exc:
        logger.error(f"Error listing conversations: {exc}", exc_info=True)
        # Return empty list instead of 500 error
        return AdminConversationListResponse(conversations=[], total=0)


@router.get("/conversations/{conversation_id}/messages", response_model=list[AdminMessageResponse])
async def get_messages(
    conversation_id: str = Path(..., description="Conversation ID"),
):
    try:
        messages = await AdminMessageService.get_messages(conversation_id)
        return [
            AdminMessageResponse(
                id=msg.get("id"),
                conversation_id=msg.get("conversation_id"),
                sender_type=msg.get("sender_type", "admin"),
                sender_id=msg.get("sender_id", "admin"),
                sender_name=msg.get("sender_name", "Admin"),
                recipient_id=msg.get("recipient_id", ""),
                product_id=msg.get("product_id"),
                product_title=msg.get("product_title"),
                subject=msg.get("subject"),
                message=msg.get("message", ""),
                message_type=msg.get("message_type", "support"),
                reply_to_message_id=msg.get("reply_to_message_id"),
                reply_preview=msg.get("reply_preview"),
                is_read=msg.get("is_read", False),
                attachments=msg.get("attachments", []),
                created_at=msg.get("created_at"),
            )
            for msg in messages
        ]
    except Exception as exc:
        logger.error(f"Error fetching messages for {conversation_id}: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str = Path(..., description="Conversation ID"),
):
    """
    Delete a conversation (all messages in it) for admin.
    """
    try:
        deleted = await AdminMessageService.delete_conversation(conversation_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"success": True, "message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error deleting conversation {conversation_id}: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))

