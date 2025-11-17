# app/api/v1/messages.py
from fastapi import APIRouter, HTTPException, status, Path, Query, Depends
from typing import Optional
from app.schemas.message import MessageCreate, MessageResponse, ConversationListResponse, ConversationResponse
from app.services.message_service import MessageService
from app.models.message import MessageType
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/send", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Send a message from supplier to customer.
    """
    try:
        supplier_id = str(current_user.id)
        
        message = await MessageService.send_message(
            supplier_id=supplier_id,
            customer_id=payload.recipient_id,
            message=payload.message,
            product_id=payload.product_id,
            message_type=payload.message_type
        )
        
        return MessageResponse(**message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending message: {str(e)}"
        )


@router.get("/conversations", response_model=ConversationListResponse)
async def get_conversations(
    current_user: User = Depends(get_current_user)
):
    """
    Get all conversations for a supplier.
    """
    try:
        supplier_id = str(current_user.id)
        conversations = await MessageService.get_conversations(supplier_id)
        
        conversation_responses = []
        for conv in conversations:
            last_msg = None
            if conv.get("last_message"):
                last_msg = MessageResponse(
                    id=conv["last_message"]["id"],
                    conversation_id=conv["conversation_id"],
                    sender_type=conv["last_message"]["sender_type"],
                    sender_id=conv["last_message"].get("sender_id", ""),
                    recipient_id="",
                    message=conv["last_message"]["message"],
                    message_type=MessageType.GENERAL,
                    is_read=False,
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching conversations: {str(e)}"
        )


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: str = Path(..., description="Conversation ID"),
    current_user: User = Depends(get_current_user)
):
    """
    Get all messages in a conversation.
    """
    try:
        supplier_id = str(current_user.id)
        messages = await MessageService.get_messages(conversation_id, supplier_id)
        
        return [MessageResponse(**msg) for msg in messages]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching messages: {str(e)}"
        )

