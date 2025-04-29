// 'use client';

// import { useState, useCallback, useEffect, useRef } from 'react';
// import { useChat as useContextChat } from '@/context/ChatContext';
// import { Chat } from '@/components/chat';
// import { UIMessage } from 'ai';
// import { toast } from 'sonner';

// type VisibilityType = 'private' | 'public';

// interface ChatBridgeProps {
//   id: string;
//   selectedChatModel: string;
// }

// type ChatStatus = 'idle' | 'loading' | 'generating';

// export function ChatBridge({ id, selectedChatModel }: ChatBridgeProps) {
//   const {
//     messages: apiMessages,
//     sendMessage,
//     isMessagesLoading,
//     isTyping,
//     error
//   } = useContextChat();

//   // local state for input and our formatted messages
//   const [input, setInput] = useState<string>('');
//   const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
//   const [status, setStatus] = useState<ChatStatus>('idle');
//   const initialMessagesSetRef = useRef<boolean>(false);

//   useEffect(() => {
//     if (isMessagesLoading) {
//       setStatus('loading');
//     } else if (isTyping) {
//       setStatus('generating');
//     } else {
//       setStatus('idle');
//     }
//   }, [isMessagesLoading, isTyping]);

//   useEffect(() => {
//     if (error) {
//       toast.error(error);
//     }
//   }, [error]);

//   // Convert each API message to a UIMessage.
//   // We explicitly cast the returned object as UIMessage to ensure that
//   // createdAt is a Date (the Chat component expects that)
//   const formatMessageForUI = useCallback((msg: any): UIMessage => {
//     const role = msg.message_type === 'user' ? 'user' : 'assistant';
//     const messageId = msg.$id || msg.message_id || `msg-${Math.random().toString(36).slice(2)}`;
//     const createdAt = msg.timestamp ? new Date(msg.timestamp) : new Date();

//     return {
//       id: messageId,
//       role,
//       content: msg.content || '',
//       createdAt
//     } as UIMessage;
//   }, []);

//   useEffect(() => {
//     if (!apiMessages || apiMessages.length === 0) return;
//     try {
//       const formatted = apiMessages.map(formatMessageForUI);
//       if (!initialMessagesSetRef.current) {
//         setInitialMessages(formatted);
//         initialMessagesSetRef.current = true;
//       }
//     } catch (err) {
//       console.error('Error formatting messages:', err);
//       toast.error('Error formatting messages');
//     }
//   }, [apiMessages, formatMessageForUI]);

//   // NOTE: We no longer pass extra props (like messages, handleSubmit, etc.)
//   // because the Chat component is declared to only accept:
//   // { id: string; initialMessages: UIMessage[]; selectedChatModel: string; selectedVisibilityType: VisibilityType; isReadonly: boolean; }
//   return (
//     <Chat
//       id={id}
//       initialMessages={initialMessages}
//       selectedChatModel={selectedChatModel}
//       selectedVisibilityType={'private' as VisibilityType}
//       isReadonly={false}
//     />
//   );
// }
