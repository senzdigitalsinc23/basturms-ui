'use client';
import { useState, useEffect } from 'react';
import { getBooks, saveBooks, addAuditLog } from '@/lib/store';
import { Book } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

const bookSchema = z.object({
  title: z.string().min(1, "Title is required."),
  author: z.string().min(1, "Author is required."),
  isbn: z.string().optional(),
  category: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

type BookFormValues = z.infer<typeof bookSchema>;

function BookForm({ onSave, existingBook }: { onSave: (data: BookFormValues) => void; existingBook?: Book | null }) {
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: existingBook || { title: '', author: '', quantity: 1, isbn: '', category: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <FormField name="title" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Book Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField name="author" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Author</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField name="isbn" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>ISBN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="category" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField name="quantity" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <DialogFooter>
          <Button type="submit">Save Book</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setBooks(getBooks());
  }, []);

  const handleSaveBook = (data: BookFormValues) => {
    if (!user) return;
    let updatedBooks;
    let action: 'created' | 'updated' = 'created';
    if (editingBook) {
      action = 'updated';
      updatedBooks = books.map(b => b.id === editingBook.id ? { ...editingBook, ...data } : b);
    } else {
      const newBook: Book = { ...data, id: `book_${Date.now()}` };
      updatedBooks = [...books, newBook];
    }
    saveBooks(updatedBooks);
    setBooks(updatedBooks);
    addAuditLog({
        user: user.email, name: user.name, action: `Book ${action}`, details: `Book: ${data.title}`
    })
    toast({ title: `Book ${action === 'created' ? 'Added' : 'Updated'}` });
    setIsFormOpen(false);
    setEditingBook(null);
  };

  const handleDeleteBook = (bookId: string) => {
    if (!user) return;
    const bookToDelete = books.find(b => b.id === bookId);
    if (!bookToDelete) return;
    const updatedBooks = books.filter(b => b.id !== bookId);
    saveBooks(updatedBooks);
    setBooks(updatedBooks);
    addAuditLog({
        user: user.email, name: user.name, action: 'Delete Book', details: `Book: ${bookToDelete.title}`
    });
    toast({ title: 'Book Deleted', variant: 'destructive' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Library Book Catalog</CardTitle>
              <CardDescription>Manage all books in the school library.</CardDescription>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => setEditingBook(null)}><PlusCircle className="mr-2" /> Add Book</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                </DialogHeader>
                <BookForm onSave={handleSaveBook} existingBook={editingBook} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map(book => (
              <Card key={book.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{book.title}</CardTitle>
                  <CardDescription>{book.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">ISBN: {book.isbn || 'N/A'}</p>
                  <p className="text-sm">Category: {book.category || 'N/A'}</p>
                  <p className="text-sm font-semibold">Quantity: {book.quantity}</p>
                </CardContent>
                <div className="p-4 border-t flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingBook(book); setIsFormOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete "{book.title}".</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteBook(book.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
            {books.length === 0 && <p className="col-span-full text-center text-muted-foreground p-8">No books in the catalog yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
