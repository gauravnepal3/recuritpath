import { headers } from "next/headers";

export const getCurrentPath = async (): Promise<string> => {
    const currentHeaders = await headers();
    const referer = currentHeaders.get('referer'); // Full URL of the referring page
    let currentPath = '/'; // Default to root
    if (referer) {
        const url = new URL(referer);
        currentPath = url.pathname; // Extract the path
    }
    return currentPath
}