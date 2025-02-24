"use client";

import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function MessagePage() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");
    const message = searchParams.get("message");

    return (
        <main>
            <div className={'relative h-screen overflow-hidden'}>
                <div className={'absolute inset-0 px-6 flex items-center justify-center'}>
                    <div className={'flex border rounded-lg p-10 flex-col items-center text-center'}>
                        {status === "success" &&
                            <div className="success-animation">
                                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" /><path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" /></svg>
                            </div>
                        }
                        <div className={'text-xl font-medium slide-in-from-bottom-5'}>
                            {status === "success" ?
                                <>
                                    You have gained access to the organization
                                </>
                                :
                                <>
                                    {message || "Something went wrong"}
                                </>
                            }
                        </div>
                        <Button variant={'secondary'} asChild={true}>
                            <Link href={'/'}>Go to Dashboard</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
