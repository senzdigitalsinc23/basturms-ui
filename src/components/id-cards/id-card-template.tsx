
'use client';
import { Staff, StudentProfile, User, SchoolProfileData, Class } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { format } from 'date-fns';

type CardData = {
  type: 'staff' | 'student';
  data: Staff | StudentProfile;
  user?: User;
};

type IDCardTemplateProps = {
    cardData: CardData;
    schoolProfile: SchoolProfileData | null;
    classes: Class[];
};

const QRCode = ({ value }: { value: string }) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(value)}`;
  return <img src={qrCodeUrl} alt="QR Code" className="w-14 h-14" />;
};


export function IDCardTemplate({ cardData, schoolProfile, classes }: IDCardTemplateProps) {
    const isStaff = cardData.type === 'staff';
    const profile = cardData.data;

    let id, name, role, photoUrl, qrValue, issueDate, expiryDate;

    if (isStaff) {
        const staff = profile as Staff;
        id = staff.staff_id;
        name = `${staff.first_name} ${staff.last_name}`;
        role = staff.roles.join(', ');
        photoUrl = cardData.user?.avatarUrl;
        issueDate = new Date(staff.date_of_joining);
        expiryDate = new Date(new Date(issueDate).setFullYear(issueDate.getFullYear() + 4)); // Assumes 4 year validity for staff
        qrValue = JSON.stringify({ type: 'staff', id: staff.staff_id, name });
    } else {
        const student = profile as StudentProfile;
        id = student.student.student_no;
        name = `${student.student.first_name} ${student.student.last_name}`;
        role = classes.find(c => c.id === student.admissionDetails.class_assigned)?.name || 'Student';
        photoUrl = student.student.avatarUrl;
        issueDate = new Date(student.admissionDetails.enrollment_date);
        expiryDate = new Date(new Date(issueDate).setFullYear(new Date(issueDate).getFullYear() + 1));
        qrValue = JSON.stringify({ type: 'student', id: student.student.student_no, name });
    }
    
    const initials = name.split(' ').map(n => n[0]).join('');

    return (
        <div className="w-[204px] h-[324px] bg-blue-900 rounded-xl shadow-lg flex flex-col font-sans overflow-hidden">
            <div className="bg-yellow-400 h-2" />
            
            {/* Header */}
            <div className="p-2 flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={schoolProfile?.logo} alt="School Logo" />
                    <AvatarFallback className="bg-white text-blue-900 font-bold">{schoolProfile?.schoolName[0]}</AvatarFallback>
                </Avatar>
                <h1 className="text-xs font-bold uppercase tracking-wider text-white flex-1 text-center">{schoolProfile?.schoolName}</h1>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center p-2 text-white flex-grow">
                <Avatar className="h-28 w-28 rounded-full border-4 border-yellow-400">
                    <AvatarImage src={photoUrl} alt={name} className="object-cover" />
                    <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="text-center mt-2">
                    <h2 className="font-bold text-lg leading-tight break-words">{name}</h2>
                    <p className="text-sm font-medium text-yellow-400">{role}</p>
                </div>

                <div className="text-xs space-y-1 mt-3 text-center">
                    <p className="font-bold flex items-center justify-center whitespace-nowrap">ID No: <span className="font-mono font-normal ml-1 truncate">{id}</span></p>
                    <div className="flex justify-center gap-4">
                        <p className="font-bold flex items-center whitespace-nowrap">Issued: <span className="font-normal ml-1">{format(issueDate, 'MM/yy')}</span></p>
                        <p className="font-bold flex items-center whitespace-nowrap">Expires: <span className="font-normal ml-1">{format(expiryDate, 'MM/yy')}</span></p>
                    </div>
                </div>

                <div className="mt-auto flex flex-col items-center">
                    <div className="bg-white p-0.5 rounded-md">
                        <QRCode value={qrValue} />
                    </div>
                    <p className="text-[9px] font-light tracking-wider text-yellow-400/80 mt-1">{schoolProfile?.motto}</p>
                </div>
            </div>
            
            {/* Footer Bar */}
            <div className="bg-yellow-400 h-4" />
        </div>
    );
}
