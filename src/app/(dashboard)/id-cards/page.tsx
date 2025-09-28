
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getStudentProfileById, getStaffByStaffId, getUsers, getSchoolProfile, getClasses } from '@/lib/store';
import { StudentProfile, Staff, User, SchoolProfileData, Class } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { IDCardTemplate } from '@/components/id-cards/id-card-template';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Link from 'next/link';

type CardData = {
  type: 'staff' | 'student';
  data: Staff | StudentProfile;
  user?: User;
};

function IDCardGenerator() {
    const searchParams = useSearchParams();
    const [cardData, setCardData] = useState<CardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [schoolProfile, setSchoolProfile] = useState<SchoolProfileData | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);

    useEffect(() => {
        const type = searchParams.get('type') as 'staff' | 'student';
        const idsParam = searchParams.get('ids');
        const school = getSchoolProfile();
        setSchoolProfile(school);
        
        if (idsParam) {
            try {
                const ids = JSON.parse(decodeURIComponent(idsParam));
                const allUsers = getUsers();
                const allClasses = getClasses();
                setClasses(allClasses);

                const data: CardData[] = ids.map((id: string) => {
                    if (type === 'staff') {
                        const staffMember = getStaffByStaffId(id);
                        if (staffMember) {
                            const user = allUsers.find(u => u.id === staffMember.user_id);
                            return { type, data: staffMember, user };
                        }
                    } else {
                        const studentProfile = getStudentProfileById(id);
                        if (studentProfile) {
                            return { type, data: studentProfile };
                        }
                    }
                    return null;
                }).filter((item: CardData | null): item is CardData => item !== null);
                
                setCardData(data);
            } catch (e) {
                console.error("Failed to parse IDs for ID card generation", e);
            }
        }
        setLoading(false);
    }, [searchParams]);

    const handlePrint = async () => {
        setLoading(true);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const cardElements = document.querySelectorAll<HTMLElement>('.id-card-container');
        const canvasPromises: Promise<HTMLCanvasElement>[] = [];

        cardElements.forEach(card => {
            canvasPromises.push(html2canvas(card, { scale: 3 }));
        });

        const canvases = await Promise.all(canvasPromises);

        const cardWidth = 85.6; // mm
        const cardHeight = 53.98; // mm
        const marginX = 10;
        const marginY = 10;
        
        canvases.forEach((canvas, index) => {
            const pageIndex = Math.floor(index / 8);
            if (pageIndex > 0 && index % 8 === 0) {
                pdf.addPage();
            }

            const localIndex = index % 8;
            const row = Math.floor(localIndex / 2);
            const col = localIndex % 2;

            const x = marginX + col * (cardWidth + marginX);
            const y = marginY + row * (cardHeight + marginY);
            
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, cardWidth, cardHeight);
        });

        pdf.save('campusconnect_id_cards.pdf');
        setLoading(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin h-8 w-8" /> <p className="ml-2">Generating IDs...</p></div>;
    }

    if (cardData.length === 0) {
        return <div className="text-center p-8">No valid IDs found to generate cards.</div>;
    }

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <div className="sticky top-0 z-10 bg-gray-100/80 backdrop-blur-sm p-4 mb-4 rounded-lg shadow-sm flex justify-between items-center print:hidden">
                <Button variant="outline" size="sm" asChild>
                    <Link href="#" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2" /> Back
                    </Link>
                </Button>
                <h1 className="text-xl font-bold font-headline">ID Card Generation</h1>
                <Button onClick={handlePrint} disabled={loading} size="sm">
                    {loading ? <Loader2 className="mr-2 animate-spin" /> : <Printer className="mr-2" />}
                    Print All
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2 print:gap-0">
                 {cardData.map((item, index) => (
                    <div key={index} className="id-card-container break-inside-avoid">
                         <IDCardTemplate 
                            cardData={item} 
                            schoolProfile={schoolProfile}
                            classes={classes}
                         />
                    </div>
                ))}
            </div>
        </div>
    );
}


export default function IDCardPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>}>
            <IDCardGenerator />
        </Suspense>
    )
}
