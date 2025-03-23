export interface IMailingTemplate {
    name: string;
    subject: string;
    body: string;
}

export const MailingTemplate: IMailingTemplate[] = [
    {
        name: 'Application Received',
        subject: 'Application Received',
        body: 'Dear {{Candidate Name}},\n\nThank you for applying to {{Job Title}} at {{Organization Name}}. We have received your application and will be reviewing it shortly. If you are selected for an interview, you will receive an email from us.\n\nBest,\n{{Organization Name}}'
    },
    {
        name: 'Message Received',
        subject: 'Message Received',
        body: 'Dear {{Candidate Name}},\n\nThank you for your message. We will get back to you shortly.\n\nBest,\n{{Company Name}}'
    },
    {
        name: 'Application Rejected',
        subject: 'Update on your application',
        body: 'Dear {{Candidate Name}},\n\nThank you for applying to {{Job Title}} at {{Organization Name}}. We regret to inform you that you have not been selected for this position. We appreciate your interest in our organization and wish you the best in your job search.\n\nBest,\n{{Organization Name}}'
    }
];