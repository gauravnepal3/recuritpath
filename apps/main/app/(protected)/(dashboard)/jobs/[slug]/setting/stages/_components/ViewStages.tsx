'use client';
import { updateJobStages } from '@/actions/jobs';
import { JobStage } from '@repo/database';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

const ViewStages = ({ jobStages, userID, jobID }: { jobStages: JobStage[], userID: string, jobID: string }) => {
    // Use a lazy initializer to ensure `items` is only set once
    const [changeDataFlag, setChangeDataFlag] = useState(false);
    const [items, setItems] = useState<JobStage[]>(() => jobStages);
    const [draggingItem, setDraggingItem] = useState<JobStage | null>(null);
    const isInitialRender = useRef(true);
    useEffect(() => {
        if (isInitialRender.current) {
            // Skip the effect on the initial render
            isInitialRender.current = false;
            return;
        }
        if (!changeDataFlag) return;
        try {
            const promise = updateJobStages({ userID: userID, jobID: jobID, jobStages: items });
            toast.promise(
                promise.then((response) => {
                    if (response.type === "ERROR") {
                        throw new Error(response.message);
                    }
                    return response.message;
                }),
                {
                    loading: "Loading...",
                    success: (message) => {
                        return message;
                    },
                    error: (error) => error.message || "Something went wrong",
                }
            );
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
        } finally {
            setChangeDataFlag(false)
        }
    }, [items]);

    const handleDragStart = (item: JobStage) => {
        if (item.isDeletable) {
            setDraggingItem(item);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetItem: JobStage) => {
        e.preventDefault();
        if (draggingItem && draggingItem.isDeletable) {
            setItems((prevItems) => {
                const updatedItems = [...prevItems];
                const draggingIndex = updatedItems.findIndex((item) => item.id === draggingItem.id);
                const targetIndex = updatedItems.findIndex((item) => item.id === targetItem.id);
                if (draggingIndex !== -1 && targetIndex !== -1) {
                    if (updatedItems[draggingIndex] && updatedItems[targetIndex]) {
                        [updatedItems[draggingIndex], updatedItems[targetIndex]] = [
                            updatedItems[targetIndex],
                            updatedItems[draggingIndex],
                        ];
                    }
                }
                return updatedItems;
            });
            setChangeDataFlag(true)
            setDraggingItem(null);
        }
    };

    return (
        <ul className="space-y-1 mt-5">
            {items.map((item) => (
                <li
                    key={item.id}
                    draggable={item.isDeletable}
                    onDragStart={item.isDeletable ? () => handleDragStart(item) : undefined}
                    onDragOver={item.isDeletable ? handleDragOver : undefined}
                    onDrop={item.isDeletable ? (e) => handleDrop(e, item) : undefined}
                    className={`bg-sidebar p-4 flex items-center gap-4 ${item.isDeletable ? 'cursor-move' : 'cursor-not-allowed'} border-input transition-all duration-200 hover:bg-muted/20`}
                >
                    <div className="flex-shrink-0"></div>
                    <div className="flex-1">
                        <h3 className="text-lg font-medium">{item.name}</h3>
                    </div>
                    <div className="flex-shrink-0 text-muted-foreground">
                        {/* <DrumIcon className="h-6 w-6 opacity-50" /> */}
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default ViewStages;