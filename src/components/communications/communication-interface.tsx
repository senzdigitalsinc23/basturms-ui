'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Mail, MessageCircle } from 'lucide-react';
import { StudentProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type CommunicationInterfaceProps = {
  student: StudentProfile;
};

export function CommunicationInterface({ student }: CommunicationInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { from: 'student', text: 'Hello, I have a question about my homework.' },
    { from: 'admin', text: 'Hi! I can help with that. What is your question?' },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { from: 'admin', text: message }]);
      setMessage('');
    }
  };
  
  const studentInitials = `${student.student.first_name[0]}${student.student.last_name[0]}`;

  return (
    <Tabs defaultValue="chat" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        <div className="flex-1">
            <TabsContent value="chat" className="m-0 h-full">
                <div className="flex flex-col h-full">
                    <div className="flex-1 space-y-4 p-4 overflow-y-auto rounded-md bg-muted/50">
                        {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex items-end gap-2 ${
                            msg.from === 'admin' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            {msg.from === 'student' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={student.student.avatarUrl} />
                                    <AvatarFallback>{studentInitials}</AvatarFallback>
                                </Avatar>
                            )}
                            <div
                            className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                                msg.from === 'admin'
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
            <TabsContent value="sms">
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                        <p>To: {student.guardianInfo.guardian_name} (Parent) at {student.guardianInfo.guardian_phone}</p>
                    </div>
                    <Textarea placeholder="Compose SMS to parent..." rows={10} />
                    <Button size="sm">Send SMS</Button>
                </div>
            </TabsContent>
            <TabsContent value="email">
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <p>To: {student.guardianInfo.guardian_email || 'No email on record'} (Parent)</p>
                    </div>
                    <Textarea placeholder="Compose Email to parent..." rows={10} />
                    <Button size="sm">Send Email</Button>
                </div>
            </TabsContent>
        </div>
    </Tabs>
  );
}
