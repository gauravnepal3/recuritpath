'use client'
import DOMPurify from "isomorphic-dompurify";

const TipTapHTMLRenderer = ({ content }: { content: string }) => {
    const sanitizedContent = DOMPurify?.sanitize(content);

    return <div className="[&_p]:text-[12px]" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};
export default TipTapHTMLRenderer;
