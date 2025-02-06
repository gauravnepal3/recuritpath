
"use server";

export async function validateRecaptcha(token: string) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
    );

    const data = await response.json();
    return data;
}