import Image from 'next/image';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { Check, CheckCircle } from 'lucide-react';

export default async function SuccessPage() {
    const user = await currentUser();
    return (
        <main>
            <div className={'relative h-screen overflow-hidden'}>
                <div className={'absolute inset-0 px-6 flex items-center justify-center'}>
                    <div className={'flex border rounded-lg p-10 flex-col items-center text-center'}>
                        <div className="success-animation">
                            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg>
                        </div>
                        <div className={'text-xl font-medium slide-in-from-bottom-5'}>
                            Payment successful
                        </div>
                        <p className={'text-sm mt-1 text-muted-foreground mb-4'}>Success! Your payment is complete, and you’re all set.</p>
                        <Button variant={'secondary'} asChild={true}>
                            {user.email ? <Link href={'/'}>Go to Dashboard</Link> : <Link href={'/auth/login'}>Go to Home</Link>}
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}