export interface IMailingTemplate {
    name: string;
    subject: string;
    body: string;
}

export const MailingTemplate: IMailingTemplate[] = [
    {
        "name": "Application Received",
        "subject": "Your Application Has Been Received",
        "body": "Dear {{CandidateName}},\n\nThank you for applying for the {{JobTitle}} position at {{OrganizationName}}. We have received your application and appreciate your interest in joining our team.\n\nOur hiring team is currently reviewing applications, and we will reach out if you are selected for the next steps. In the meantime, feel free to explore more about our company and what we do.\n\nIf you have any questions, don’t hesitate to contact us.\n\nBest regards,\n{{OrganizationName}}"
    },
    {
        "name": "Application Rejected",
        "subject": "Update on Your Application",
        "body": "Dear {{CandidateName}},\n\nThank you for applying for the {{JobTitle}} position at {{OrganizationName}}. After careful consideration, we regret to inform you that we have moved forward with other candidates for this role.\n\nWe truly appreciate the time and effort you put into your application and encourage you to apply for future opportunities that match your skills and experience.\n\nWishing you the best in your job search!\n\nBest regards,\n{{OrganizationName}}"
    }
]
