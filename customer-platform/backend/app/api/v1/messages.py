# app/api/v1/messages.py
from fastapi import APIRouter, HTTPException, status, Path, Query, Response
import logging
from app.schemas.message import (
    MessageCreate,
    MessageResponse,
    ConversationListResponse,
    ConversationResponse,
    UnreadCountResponse,
)
from app.services.message_service import MessageService
from app.models.message import MessageType, MessageSender

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/send", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    payload: MessageCreate,
    customer_id: str = Query(..., description="Customer ID")
):
    """
    Send a message from customer to supplier.
    """
    try:
        supplier_id = payload.recipient_id
        if supplier_id != "admin" and not supplier_id and not payload.product_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either supplier ID or product ID is required",
            )
        
        message = await MessageService.send_message(
            customer_id=customer_id,
            supplier_id=supplier_id,
            message=payload.message,
            product_id=payload.product_id,
            message_type=payload.message_type,
            reply_to_message_id=payload.reply_to_message_id,
        )
        
        return MessageResponse(**message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending message: {str(e)}"
        )


@router.get("/conversations", response_model=ConversationListResponse)
async def get_conversations(
    customer_id: str = Query(..., description="Customer ID")
):
    """
    Get all conversations for a customer.
    """
    try:
        conversations = await MessageService.get_conversations(customer_id)
        
        conversation_responses = []
        for conv in conversations:
            last_msg = None
            if conv.get("last_message"):
                # Convert string sender_type to MessageSender enum
                sender_type_str = conv["last_message"].get("sender_type", "customer")
                try:
                    sender_type = MessageSender(sender_type_str)
                except ValueError:
                    # Fallback to customer if invalid
                    sender_type = MessageSender.CUSTOMER
                
                # Convert string message_type to MessageType enum
                message_type_str = conv["last_message"].get("message_type", "general")
                try:
                    message_type = MessageType(message_type_str)
                except ValueError:
                    message_type = MessageType.GENERAL
                
                last_msg = MessageResponse(
                    id=conv["last_message"]["id"],
                    conversation_id=conv["conversation_id"],
                    sender_type=sender_type,
                    sender_id=conv["last_message"].get("sender_id", ""),
                    recipient_id=conv["last_message"].get("recipient_id", ""),
                    product_id=conv["last_message"].get("product_id"),
                    product_title=conv["last_message"].get("product_title"),
                    message=conv["last_message"]["message"],
                    message_type=message_type,
                    reply_to_message_id=conv["last_message"].get("reply_to_message_id"),
                    reply_preview=conv["last_message"].get("reply_preview"),
                    is_read=conv["last_message"].get("is_read", False),
                    created_at=conv["last_message"]["created_at"]
                )
            
            conversation_responses.append(ConversationResponse(
                conversation_id=conv["conversation_id"],
                other_party_id=conv["other_party_id"],
                other_party_name=conv["other_party_name"],
                other_party_type=conv["other_party_type"],
                product_id=conv.get("product_id"),
                product_title=conv.get("product_title"),
                last_message=last_msg,
                unread_count=conv["unread_count"],
                created_at=conv["created_at"],
                updated_at=conv["updated_at"]
            ))
        
        return ConversationListResponse(
            conversations=conversation_responses,
            total=len(conversation_responses)
        )
    except Exception as e:
        import traceback
        logger.error(f"Error fetching conversations for customer {customer_id}: {e}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching conversations: {str(e)}"
        )


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: str = Path(..., description="Conversation ID"),
    customer_id: str = Query(..., description="Customer ID")
):
    """
    Get all messages in a conversation.
    """
    try:
        messages = await MessageService.get_messages(conversation_id, customer_id)
        
        message_responses = []
        for msg in messages:
            # Convert string sender_type to MessageSender enum
            sender_type_str = msg.get("sender_type", "customer")
            try:
                sender_type = MessageSender(sender_type_str)
            except ValueError:
                sender_type = MessageSender.CUSTOMER
            
            # Convert string message_type to MessageType enum
            message_type_str = msg.get("message_type", "general")
            try:
                message_type = MessageType(message_type_str)
            except ValueError:
                message_type = MessageType.GENERAL
            
            message_responses.append(MessageResponse(
                id=msg.get("id", ""),
                conversation_id=msg.get("conversation_id", ""),
                sender_type=sender_type,
                sender_id=msg.get("sender_id", ""),
                recipient_id=msg.get("recipient_id", ""),
                product_id=msg.get("product_id"),
                product_title=msg.get("product_title"),
                message=msg.get("message", ""),
                message_type=message_type,
                reply_to_message_id=msg.get("reply_to_message_id"),
                reply_preview=msg.get("reply_preview"),
                is_read=msg.get("is_read", False),
                created_at=msg.get("created_at")
            ))
        
        return message_responses
    except Exception as e:
        import traceback
        logger.error(f"Error fetching messages: {e}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching messages: {str(e)}"
        )


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    customer_id: str = Query(..., description="Customer ID"),
) -> Response:
    success = await MessageService.delete_conversation(conversation_id, customer_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    customer_id: str = Query(..., description="Customer ID"),
) -> UnreadCountResponse:
    count = await MessageService.get_unread_count(customer_id)
    return UnreadCountResponse(unread_count=count)

