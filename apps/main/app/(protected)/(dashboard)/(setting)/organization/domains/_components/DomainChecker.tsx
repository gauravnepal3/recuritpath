"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { deleteDomain } from "@/actions/organization";

const REQUIRED_CNAME = "yourapp.com"; // Replace with your actual CNAME target

const DomainChecker = ({ domainName, organizationId }: { domainName: string, organizationId: string }) => {
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCNAMESet, setIsCNAMESet] = useState<boolean | null>(null);



    function onSubmit() {
        try {
            const promise = deleteDomain({
                organizationId: organizationId, // replace with actual organizationId
                domainName: domainName,
            })
            toast.promise(
                promise.then((response) => {
                    // Check the custom response type
                    if (response.type === "ERROR") {
                        throw new Error(response.message); // Throw error to trigger the `error` toast
                    }
                    return response.message; // Success case, pass the message for the `success` toast
                }),
                {
                    loading: "Loading...",
                    success: (message) => {
                        return message; // Display the success message
                    },
                    error: (error) => error.message || "Something went wrong", // Show the error message
                }
            );
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
        } finally {
        }
    }


    const fetchCNAME = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/check-cname?domain=${domainName}`);
            const data = await res.json();

            if (data.error) {
                setIsValid(false);
                setIsCNAMESet(false);
                return;
            }

            // Check if the required CNAME is correctly set
            const hasRequiredCNAME = data.cnameRecords.includes(REQUIRED_CNAME);

            setIsCNAMESet(hasRequiredCNAME);
            setIsValid(hasRequiredCNAME);
        } catch (error) {
            setIsValid(false);
            setIsCNAMESet(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCNAME(); // Check on mount
        const interval = setInterval(() => fetchCNAME(), 30000); // Auto-refresh every 30 sec
        return () => clearInterval(interval); // Cleanup interval
    }, [domainName]);

    return (
        <div className="flex justify-between pr-3 items-center">
            <div>
                <h2 className="">{domainName}</h2>

                <div className="mt-2">
                    {isValid === null ? (
                        <p className="text-muted-foreground text-xs">Checking CNAME record...</p>
                    ) : isValid ? (
                        <p className="text-green-600 flex items-center text-xs gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" /> CNAME is correctly set up!
                        </p>
                    ) : (
                        <div className="text-red-600">
                            <p className="flex text-xs gap-2 items-center">
                                <XCircle className="w-3 h-3 text-red-500" /> CNAME record is missing!
                            </p>
                            <p className="text-muted-foreground text-xs mt-2">
                                Please add the following CNAME record:
                            </p>
                            <ul className="list-disc text-left pl-6 mt-2">
                                <li className="text-muted-foreground">
                                    <b>Host:</b> <code>{domainName}</code>
                                </li>
                                <li className="text-muted-foreground">
                                    <b>Points to:</b> <code>{REQUIRED_CNAME}</code>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button disabled={isLoading} variant="ghost" onClick={fetchCNAME}>
                    {isLoading ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="animate-spin"
                        >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    ) : "Refresh"}
                </Button>
                <Button onClick={() => onSubmit()}>
                    Delete
                </Button>
            </div>
        </div>
    );
};

export default DomainChecker;
