ok so to help more and dio more planning i will give the chat ui that i did and the old one
based on this
and what you thought about the codebase
generate the perfect codebase plan design very well so we do something to learn from and sclabe and good

so as you can see in this code it s using my componnet
but the the code from vercel codebase use some components present in my codebase but some of them is next serverW
what i want is to use the client side one
and merge them with my existing chat since it s look good but lack some features like history and conversation what i will do is that i will give the code first of them and then based on it and what component they used you will deduce how to to something like them or come just with a plan how to tckle this
you have acces to the codebase and this code import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { DBMessage } from '@/lib/db/schema';
import { Attachment, UIMessage } from 'ai';

export default async function Page(props: { params: Promise<{ id: string }> }) {
const params = await props.params;
const { id } = params;
const chat = await getChatById({ id });

if (!chat) {
notFound();
}

const session = await auth();

if (chat.visibility === 'private') {
if (!session || !session.user) {
return notFound();
}

    if (session.user.id !== chat.userId) {
      return notFound();
    }

}

const messagesFromDb = await getMessagesByChatId({
id,
});

function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
return messages.map((message) => ({
id: message.id,
parts: message.parts as UIMessage['parts'],
role: message.role as UIMessage['role'],
// Note: content will soon be deprecated in @ai-sdk/react
content: '',
createdAt: message.createdAt,
experimental_attachments:
(message.attachments as Array<Attachment>) ?? [],
}));
}

const cookieStore = await cookies();
const chatModelFromCookie = cookieStore.get('chat-model');

if (!chatModelFromCookie) {
return (
<>
<Chat
id={chat.id}
initialMessages={convertToUIMessages(messagesFromDb)}
selectedChatModel={DEFAULT_CHAT_MODEL}
selectedVisibilityType={chat.visibility}
isReadonly={session?.user?.id !== chat.userId}
/>
<DataStreamHandler id={id} />
</>
);
}

return (
<>
<Chat
id={chat.id}
initialMessages={convertToUIMessages(messagesFromDb)}
selectedChatModel={chatModelFromCookie.value}
selectedVisibilityType={chat.visibility}
isReadonly={session?.user?.id !== chat.userId}
/>
<DataStreamHandler id={id} />
</>
);
}

so just based on it think what else you need or what changes we need to do
think plan good
