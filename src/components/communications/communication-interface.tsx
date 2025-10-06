
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Mail, MessageCircle } from 'lucide-react';
import { StudentProfile, Staff } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type SelectedEntity = 
    | { type: 'student'; data: StudentProfile }
    | { type: 'staff'; data: Staff };

type CommunicationInterfaceProps = {
  selectedEntity: SelectedEntity;
};

export function CommunicationInterface({ selectedEntity }: CommunicationInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { from: 'them', text: 'Hello, I have a question.' },
    { from: 'me', text: 'Hi! I can help with that. What is your question?' },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { from: 'me', text: message }]);
      setMessage('');
    }
  };
  
  const isStudent = selectedEntity.type === 'student';
  const entityName = isStudent 
    ? `${selectedEntity.data.student.first_name} ${selectedEntity.data.student.last_name}` 
    : `${selectedEntity.data.first_name} ${selectedEntity.data.last_name}`;

  const avatarUrl = isStudent ? selectedEntity.data.student.avatarUrl : undefined;
  const initials = entityName.split(' ').map(n => n[0]).join('');

  return (
    <Tabs defaultValue="chat" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="sms" disabled={selectedEntity.type === 'staff'}>SMS</TabsTrigger>
            <TabsTrigger value="email" disabled={selectedEntity.type === 'staff'}>Email</TabsTrigger>
        </TabsList>
        <div className="flex-1">
            <TabsContent value="chat" className="m-0 h-full">
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b font-semibold">{entityName}</div>
                    <div className="flex-1 space-y-4 p-4 overflow-y-auto rounded-md bg-muted/50">
                        {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex items-end gap-2 ${
                            msg.from === 'me' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            {msg.from === 'them' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={avatarUrl} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                            )}
                            <div
                            className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                                msg.from === 'me'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background'
                            }`}
                            >
                            {msg.text}
                            </div>
                        </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 p-4 border-t">
                        <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-0 resize-none"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                            }
                        }}
                        />
                        <Button onClick={handleSendMessage} size="sm">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </div>
            </TabsContent>
            {isStudent && (
              <>
                <TabsContent value="sms">
                    <div className="p-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                            <MessageCircle className="h-5 w-5 text-muted-foreground" />
                            <p>To: {(selectedEntity.data as StudentProfile).guardianInfo.guardian_name} (Parent) at {(selectedEntity.data as StudentProfile).guardianInfo.guardian_phone}</p>
                        </div>
                        <Textarea placeholder="Compose SMS to parent..." rows={10} />
                        <Button size="sm">Send SMS</Button>
                    </div>
                </TabsContent>
                <TabsContent value="email">
                    <div className="p-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <p>To: {(selectedEntity.data as StudentProfile).guardianInfo.guardian_email || 'No email on record'} (Parent)</p>
                        </div>
                        <Textarea placeholder="Compose Email to parent..." rows={10} />
                        <Button size="sm">Send Email</Button>
                    </div>
                </TabsContent>
              </>
            )}
        </div>
    </Tabs>
  );
}
