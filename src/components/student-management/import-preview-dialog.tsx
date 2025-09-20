'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';

interface ImportPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: any[];
}

export function ImportPreviewDialog({
  isOpen,
  onClose,
  onConfirm,
  data,
}: ImportPreviewDialogProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const headers = Object.keys(data[0]);
  const rowCount = data.length;
  const colCount = headers.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Preview</DialogTitle>
          <DialogDescription>
            Review the data below before importing. A total of {rowCount} records and {colCount} columns found. Scroll to see all records and columns.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-auto max-h-[60vh] border rounded-md">
            <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                    {headers.map((header) => (
                    <TableHead key={header} className="whitespace-nowrap">{header}</TableHead>
                    ))}
                </TableRow>
                </TableHeader>
                <TableBody>
                {data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                    {headers.map((header) => (
                        <TableCell key={`${rowIndex}-${header}`} className="whitespace-nowrap max-w-[200px] truncate">
                        {row[header]}
                        </TableCell>
                    ))}
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
