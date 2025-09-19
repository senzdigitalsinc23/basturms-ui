import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LoginPage() {
  const loginBg = PlaceHolderImages.find((img) => img.id === 'login-background');
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <Image
          src={loginBg?.imageUrl || "https://picsum.photos/seed/loginbg/1920/1080"}
          alt="Abstract background"
          fill
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          data-ai-hint={loginBg?.imageHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 p-4 bg-black/50 rounded-lg">
           <h1 className="text-4xl font-bold font-headline text-white">CampusConnect</h1>
            <p className="text-white/80 mt-2">The all-in-one solution for modern school management.</p>
        </div>
      </div>
    </div>
  );
}
