
'use client';
import { Staff, StudentProfile, User, SchoolProfileData, Class } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

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
  return <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16" />;
};


export function IDCardTemplate({ cardData, schoolProfile, classes }: IDCardTemplateProps) {
    const isStaff = cardData.type === 'staff';
    const profile = cardData.data;

    let id, name, role, photoUrl, qrValue;

    if (isStaff) {
        const staff = profile as Staff;
        id = staff.staff_id;
        name = `${staff.first_name} ${staff.last_name}`;
        role = staff.roles.join(', ');
        photoUrl = cardData.user?.avatarUrl;
        qrValue = JSON.stringify({ type: 'staff', id: staff.staff_id, name });
    } else {
        const student = profile as StudentProfile;
        id = student.student.student_no;
        name = `${student.student.first_name} ${student.student.last_name}`;
        role = classes.find(c => c.id === student.admissionDetails.class_assigned)?.name || 'Student';
        photoUrl = student.student.avatarUrl;
        qrValue = JSON.stringify({ type: 'student', id: student.student.student_no, name });
    }
    
    const initials = name.split(' ').map(n => n[0]).join('');

    return (
        <div className="w-[325px] h-[200px] bg-white rounded-xl shadow-lg overflow-hidden flex font-sans">
            {/* Left Part */}
            <div className="w-1/3 bg-gray-50 flex flex-col items-center justify-center p-2 space-y-2 border-r border-gray-200">
                 <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                    <AvatarImage src={photoUrl} alt={name} />
                    <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h2 className="font-bold text-sm text-gray-800 break-words">{name}</h2>
                    <p className="text-xs text-gray-500">{role}</p>
                </div>
            </div>
            
            {/* Right Part */}
            <div className="w-2/3 flex flex-col bg-primary/5">
                <div className="bg-primary text-primary-foreground p-2 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={schoolProfile?.logo} alt="School Logo" />
                            <AvatarFallback>{schoolProfile?.schoolName[0]}</AvatarFallback>
                        </Avatar>
                        <h1 className="text-xs font-bold uppercase tracking-wider">{schoolProfile?.schoolName}</h1>
                    </div>
                </div>
                
                <div className="flex-1 p-3 flex justify-between items-center">
                     <div className="text-xs space-y-1 text-gray-700 overflow-hidden">
                        <p className="font-bold flex items-center whitespace-nowrap">ID No: <span className="font-mono font-normal ml-1 truncate">{id}</span></p>
                        <p className="font-bold whitespace-nowrap truncate">Email: <span className="font-normal">{isStaff ? (profile as Staff).email : (profile as StudentProfile).contactDetails.email}</span></p>
                         <p className="font-bold">Issued: <span className="font-normal">{new Date().toLocaleDateString('en-GB')}</span></p>
                         <p className="font-bold">Expires: <span className="font-normal">{new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-GB')}</span></p>
                     </div>
                     <div className="flex flex-col items-center">
                        <QRCode value={qrValue} />
                     </div>
                </div>

                 <div className="bg-primary text-primary-foreground text-[8px] text-center p-1 font-light tracking-wider">
                   {schoolProfile?.motto}
                </div>
            </div>
        </div>
    );
}
