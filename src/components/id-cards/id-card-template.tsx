
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
        expiryDate = new Date(issueDate.setFullYear(issueDate.getFullYear() + 4)); // Assumes 4 year validity for staff
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
        <div className="w-[325px] h-[200px] bg-blue-900 rounded-xl shadow-lg flex font-sans text-gray-800">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-2 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border-2 border-yellow-400">
                        <AvatarImage src={schoolProfile?.logo} alt="School Logo" />
                        <AvatarFallback className="bg-white text-blue-900 font-bold">{schoolProfile?.schoolName[0]}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-sm font-bold uppercase tracking-wider text-white">{schoolProfile?.schoolName}</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full flex mt-12">
                 {/* Left Side (Photo) */}
                <div className="w-1/3 flex flex-col items-center justify-center p-2 space-y-2">
                    <div className="w-24 h-28 bg-white p-1 rounded-md shadow-md border-2 border-yellow-400">
                         <Avatar className="h-full w-full rounded-none">
                            <AvatarImage src={photoUrl} alt={name} className="object-cover" />
                            <AvatarFallback className="text-4xl rounded-none">{initials}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                {/* Right Side (Details) */}
                 <div className="w-2/3 flex flex-col justify-between text-white p-2 pl-4">
                    <div className="flex-1">
                        <h2 className="font-bold text-lg leading-tight break-words">{name}</h2>
                        <p className="text-xs font-medium bg-yellow-400 text-blue-900 inline-block px-2 py-0.5 rounded-full my-1">{role}</p>
                        <div className="text-xs space-y-0.5 mt-2 overflow-hidden">
                            <p className="font-bold flex items-center whitespace-nowrap">ID No: <span className="font-mono font-normal ml-1 truncate">{id}</span></p>
                            <p className="font-bold flex items-center whitespace-nowrap">Issued: <span className="font-normal ml-1">{format(issueDate, 'MM/yy')}</span></p>
                            <p className="font-bold flex items-center whitespace-nowrap">Expires: <span className="font-normal ml-1">{format(expiryDate, 'MM/yy')}</span></p>
                        </div>
                    </div>
                     <div className="flex items-end justify-between">
                         <div className="text-[8px] font-light tracking-wider w-2/3">
                            <p>{schoolProfile?.motto}</p>
                         </div>
                        <div className="bg-white p-0.5 rounded-md">
                            <QRCode value={qrValue} />
                        </div>
                    </div>
                </div>
            </div>
             {/* Footer Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-yellow-400" />
        </div>
    );
}

