"use client";
import React from 'react'
import MessageUserDetails from './MessageUserDetails'

import { useEffect, useRef } from "react";

function extractUserReply(html: string): string {
    // Step 1: Remove quoted content (Gmail replies & previous emails)
    const cleanHtml = html.split('<div class="gmail_quote"')[0] || html;

    // Step 2: Extract only the user reply inside <div dir="ltr">
    const replyMatch = /<div\s+dir="ltr">(.*?)<\/div>/is.exec(cleanHtml);

    let replyText = replyMatch ? replyMatch[1] : cleanHtml || '';
    replyText = replyText || '';

    // Step 3: Remove remaining HTML tags, keeping only text & line breaks
    replyText = replyText
        .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to new lines
        .replace(/<[^>]+>/g, '')       // Remove all remaining HTML tags
        .trim();

    return replyText;
}

type candidateMessagesType = {
    id: string,
    direction: 'RECEIVED' | 'SENT',
    createdAt: Date
    body: string
    candidate: {
        formResponses: {
            label: string;
            value: string | null;
            id: string;
        }[];
        id: string;
    };
    user: {
        name: string | null;
        image: string | null;
        email: string | null;
    };
}

const MessageBox = ({ candidateMessages }: { candidateMessages: candidateMessagesType[] }) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-4 flex flex-col-reverse">

            {candidateMessages.map(x => (
                <div key={x.id} className="p-3 border mb-4 first:mt-4 first:mb-2 rounded">
                    {x.direction === "RECEIVED" ? (
                        <MessageUserDetails
                            isCandidateMessage={true}
                            name={x.candidate.formResponses.find(x => x.label === "Name")?.value ?? ''}
                            createdAt={x.createdAt}
                        />
                    ) : (
                        <MessageUserDetails
                            isCandidateMessage={false}
                            name={x.user.name ?? ''}
                            createdAt={x.createdAt}
                        />
                    )}
                    {x.direction === "RECEIVED" ? extractUserReply(x.body) : x.body}
                </div>
            ))}
            <div className="text-xs pt-4 text-muted-foreground text-center">
                This is the start of the conversation
            </div>
        </div>

    )
}

export default MessageBox