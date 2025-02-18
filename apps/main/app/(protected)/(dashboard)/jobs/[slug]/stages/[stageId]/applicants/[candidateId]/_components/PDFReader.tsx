'use client'
import { Document, Page, pdfjs } from 'react-pdf';
import React from 'react'
import "react-pdf/dist/esm/Page/TextLayer.css";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Skeleton } from '@repo/ui/components/skeleton';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();


const PDFReader = ({ url }: { url: string }) => {
    const [numPages, setNumPages] = React.useState<number>();
    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    return (
        <Document
            file={url}
            loading={
                <div className="flex flex-col space-y-3">
                    <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            }
            onLoadSuccess={onDocumentLoadSuccess}
        >
            <div className="overflow-y-auto p-0">
                {numPages &&
                    Array.from({ length: numPages }, (_, index) => index + 1).map(
                        (pageNumber) => <Page key={pageNumber} pageNumber={pageNumber} />
                    )}
            </div>
        </Document>
    )
}

export default PDFReader