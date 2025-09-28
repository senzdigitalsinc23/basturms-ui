
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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
    const [selectedCards, setSelectedCards] = useState<Record<number, boolean>>({});
    const { toast } = useToast();

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

    const handlePrint = async (indexesToPrint?: number[]) => {
        setLoading(true);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const cardElements = document.querySelectorAll<HTMLElement>('.id-card-container');
        
        const indices = indexesToPrint ?? Array.from(cardElements.keys());

        if (indices.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Cards Selected',
                description: 'Please select at least one card to print.'
            });
            setLoading(false);
            return;
        }

        const canvasPromises: Promise<HTMLCanvasElement>[] = [];
        indices.forEach(index => {
            const card = cardElements[index];
            if (card) {
                canvasPromises.push(html2canvas(card, { scale: 3, backgroundColor: null }));
            }
        });

        const canvases = await Promise.all(canvasPromises);

        const cardWidth = 85.6; // Standard ID-1 width in mm
        const cardHeight = 53.98; // Standard ID-1 height in mm
        const a4Width = 210;
        const a4Height = 297;
        const cols = 3;
        const rows = 3;
        const cardsPerPage = cols * rows;
        const marginX = (a4Width - (cols * cardWidth)) / (cols + 1);
        const marginY = (a4Height - (rows * cardHeight)) / (rows + 1);

        canvases.forEach((canvas, index) => {
            const pageIndex = Math.floor(index / cardsPerPage);
            if (pageIndex > 0 && index % cardsPerPage === 0) {
                pdf.addPage();
            }

            const localIndex = index % cardsPerPage;
            const row = Math.floor(localIndex / cols);
            const col = localIndex % cols;

            const x = marginX + col * (cardWidth + marginX);
            const y = marginY + row * (cardHeight + marginY);
            
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, cardWidth, cardHeight);
        });

        pdf.save('campusconnect_id_cards.pdf');
        setLoading(false);
    };

    const toggleSelectCard = (index: number) => {
        setSelectedCards(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const toggleSelectAll = (checked: boolean) => {
        const newSelection: Record<number, boolean> = {};
        if (checked) {
            cardData.forEach((_, index) => {
                newSelection[index] = true;
            });
        }
        setSelectedCards(newSelection);
    };

    const selectedIndexes = Object.keys(selectedCards).filter(key => selectedCards[Number(key)]).map(Number);
    const isAllSelected = cardData.length > 0 && selectedIndexes.length === cardData.length;

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin h-8 w-8" /> <p className="ml-2">Generating IDs...</p></div>;
    }

    if (cardData.length === 0) {
        return <div className="text-center p-8">No valid IDs found to generate cards. Please go back and select staff or students.</div>;
    }

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <div className="sticky top-0 z-10 bg-gray-100/80 backdrop-blur-sm p-4 mb-4 rounded-lg shadow-sm flex justify-between items-center print:hidden">
                <Button variant="outline" size="sm" asChild>
                    <Link href="#" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2" /> Back
                    </Link>
                </Button>
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="select-all" checked={isAllSelected} onCheckedChange={toggleSelectAll} />
                        <Label htmlFor="select-all">Select All</Label>
                    </div>
                     <Button onClick={() => handlePrint(selectedIndexes)} disabled={loading || selectedIndexes.length === 0} size="sm" variant="secondary">
                        {loading ? <Loader2 className="mr-2 animate-spin" /> : <Printer className="mr-2" />}
                        Print Selected ({selectedIndexes.length})
                    </Button>
                    <Button onClick={() => handlePrint()} disabled={loading} size="sm">
                        {loading ? <Loader2 className="mr-2 animate-spin" /> : <Printer className="mr-2" />}
                        Print All ({cardData.length})
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-0">
                 {cardData.map((item, index) => (
                    <div key={index} className="relative break-inside-avoid">
                        <div className="absolute top-2 left-2 z-10 print:hidden">
                            <Checkbox 
                                id={`select-card-${index}`} 
                                checked={!!selectedCards[index]} 
                                onCheckedChange={() => toggleSelectCard(index)}
                                className="bg-white border-primary"
                            />
                        </div>
                        <div className="id-card-container">
                            <IDCardTemplate 
                                cardData={item} 
                                schoolProfile={schoolProfile}
                                classes={classes}
                            />
                        </div>
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
