
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAssets } from '@/lib/store';
import { Asset } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';

const QRCode = ({ value }: { value: string }) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(value)}`;
  return <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16" />;
};

function AssetTag({ asset, uniqueId }: { asset: Asset, uniqueId: string }) {
    return (
        <div className="w-[150px] h-[90px] border-2 border-dashed border-gray-400 rounded-lg p-2 flex flex-col justify-between break-inside-avoid font-sans">
            <div className="text-center">
                <p className="text-[8px] font-bold uppercase truncate">{asset.name}</p>
                <p className="text-[7px] text-gray-600">{uniqueId}</p>
            </div>
            <div className="flex items-center justify-center">
                <QRCode value={JSON.stringify({ assetId: asset.id, uniqueId })} />
            </div>
        </div>
    );
}

function AssetTagsPageContent() {
    const searchParams = useSearchParams();
    const assetId = searchParams.get('assetId');
    const asset = getAssets().find(a => a.id === assetId);

    if (!asset) {
        return (
            <div className="text-center p-8">
                <h1 className="text-xl font-bold">Asset not found.</h1>
                <p>Could not generate tags for the specified asset.</p>
                <Button asChild variant="link" className="mt-4">
                    <Link href="/inventory/assets">
                        <ArrowLeft className="mr-2" /> Back to Asset Register
                    </Link>
                </Button>
            </div>
        );
    }
    
    const tagsToGenerate = Array.from({ length: asset.quantity }, (_, i) => `${asset.id}-${String(i + 1).padStart(3, '0')}`);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <div className="sticky top-0 z-10 bg-gray-100/80 backdrop-blur-sm p-4 mb-4 rounded-lg shadow-sm flex justify-between items-center print:hidden">
                 <div>
                    <h1 className="text-2xl font-bold font-headline">Print Asset Tags for: {asset.name}</h1>
                    <p className="text-muted-foreground">A total of {asset.quantity} tags have been generated.</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/inventory/assets">
                            <ArrowLeft className="mr-2" /> Back to Register
                        </Link>
                    </Button>
                    <Button onClick={handlePrint} size="sm">
                        <Printer className="mr-2" /> Print Tags
                    </Button>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
                {tagsToGenerate.map(uniqueId => (
                    <AssetTag key={uniqueId} asset={asset} uniqueId={uniqueId} />
                ))}
            </div>
        </div>
    );
}

export default function AssetTagsPage() {
    return (
        <Suspense fallback={<div>Loading asset tags...</div>}>
            <AssetTagsPageContent />
        </Suspense>
    )
}
