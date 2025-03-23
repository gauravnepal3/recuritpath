"use client"
import {
    useState
} from "react"
import {
    toast
} from "sonner"
import {
    useForm
} from "react-hook-form"
import {
    zodResolver
} from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    cn
} from "@/lib/utils"
import {
    Button
} from "@repo/ui/components/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@repo/ui/components/form"

import { format } from 'date-fns'
import {
    Input
} from "@repo/ui/components/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@repo/ui/components/select"
import LocationSelector from "@repo/ui/components/location-input"

import { ChevronsUpDown, Check, CarTaxiFront, CalendarIcon } from "lucide-react"
import countries from '@repo/ui/data/countries.json'
import { MultiSelect } from "@repo/ui/components/multi-select"
import { Cat, Dog, Fish, Rabbit, Turtle } from "lucide-react";
import ChildForm from "./ChildForm"
import { JobPost } from "@prisma/client"
import { updateJobDetails } from "@/actions/jobs"
import { Calendar } from "@repo/ui/components/calendar"
const formSchema = z.object({
    title: z.string({ required_error: "Title is required" }).min(1, { message: "Title is required" }),
    category: z.string().optional(),
    employmentType: z.string().optional(),
    country: z.tuple([z.string(), z.string().optional()]).optional(),
    city: z.string().optional(),
    remoteOption: z.string().optional(),

    countryResidence: z.string().optional(),
    countryListResidence: z.string().array().optional(),
    displaySalary: z.string().optional(),
    currency: z.string().optional(),
    salaryAmount: z.coerce.number({ message: "Amount must be a number" }).optional(),
    minimumAmount: z.coerce.number({ message: "Amount must be a number" }).optional(),
    maximumAmount: z.coerce.number({ message: "Amount must be a number" }).optional()
}).superRefine(
    (data, ctx) => {
        if (data.countryResidence === "Yes" && (data.countryListResidence?.length ?? 0) < 1) {
            ctx.addIssue(
                {
                    message: "Country is required",
                    code: z.ZodIssueCode.custom,
                    path: ['countryListResidence']
                }
            )
        }

        if (data.minimumAmount && (data.minimumAmount < 0)) {
            ctx.addIssue(
                {
                    message: "Minimum Amount cannot be less than 0",
                    code: z.ZodIssueCode.custom,
                    path: ['minimumAmount']
                }
            )
        }

        if (data.maximumAmount && data.maximumAmount < 0) {
            ctx.addIssue(
                {
                    message: "Maximum Amount cannot be less than 0",
                    code: z.ZodIssueCode.custom,
                    path: ['maximumAmount']
                }
            )
        }

        if (data.salaryAmount && data.salaryAmount < 0) {
            ctx.addIssue(
                {
                    message: "Amount cannot be less than 0",
                    code: z.ZodIssueCode.custom,
                    path: ['salaryAmount']
                }
            )
        }
        if ((data.displaySalary === "Fixed Amount" || data.displaySalary === "Range")) {

            if (!data.currency) {
                ctx.addIssue(
                    {
                        message: "Currency is required",
                        code: z.ZodIssueCode.custom,
                        path: ['currency']
                    }
                )
            }

            if (data.displaySalary === "Fixed Amount" && !data.salaryAmount) {
                ctx.addIssue(
                    {
                        message: "Amount is required",
                        code: z.ZodIssueCode.custom,
                        path: ['salaryAmount']
                    }
                )
            }

            if (data.displaySalary === "Range" && !data.minimumAmount) {
                ctx.addIssue(
                    {
                        message: "Minimum is required",
                        code: z.ZodIssueCode.custom,
                        path: ['minimumAmount']
                    }
                )
            }
            if (data.displaySalary === "Range" && (!data.maximumAmount)) {
                ctx.addIssue(
                    {
                        message: "Maximum is required",
                        code: z.ZodIssueCode.custom,
                        path: ['maximumAmount']
                    }
                )
            }
        }
    }
);

const jobCategory = [
    'Sales & Marketing',
    'Design & User Experience',
    'Product Manager',
    'Customer & Community',
    'Software Development',
    'Security',
    'Accounts & Finance',
    'HR & Recruiting'
]

const employmentType = [
    'Full Time',
    'Part Time',
    'Temporary',
    'Contract',
    'Internship',
    'Volunteer',
]

const remoteOptions = [
    'No Remote',
    'Hybrid',
    'Remote only'
]


export default function MyForm({ jobDetails, userID, jobID }: { jobDetails: JobPost, userID: string, jobID: string }) {
    const [selectedCountryResidence, setSelectedCountryResidence] = useState<string[]>(jobDetails.countryListResidence);
    const countryData = countries.map(x => ({ label: x.name, value: x.iso3, flag: x.emoji }))
    const [countryName, setCountryName] = useState<string>(jobDetails.country?.split('/')[0] ?? '')
    const [stateName, setStateName] = useState<string>(jobDetails.country?.split('/')[1] ?? '')
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: jobDetails.title,
            category: jobDetails.category ?? undefined,
            employmentType: jobDetails.employmentType ?? undefined,
            country: jobDetails.country ? [jobDetails.country?.split('/')[0], jobDetails.country?.split('/')[1]] : undefined,
            city: jobDetails.city ?? '',
            remoteOption: jobDetails.remoteOption ?? undefined,
            countryResidence: jobDetails.countryResidence ?? 'No',
            countryListResidence: jobDetails.countryListResidence,
            displaySalary: jobDetails.displaySalary ?? "Not Shown",
            currency: jobDetails.currency ?? '',
            salaryAmount: jobDetails.salaryAmount ?? undefined,
            minimumAmount: jobDetails.minimumAmount ?? undefined,
            maximumAmount: jobDetails.maximumAmount ?? undefined,
        },

    })
    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const promise = updateJobDetails({ userID: userID, jobID: jobID, data: values, organizationID: jobDetails.organizationId })
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
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 mx-auto py-3">
                <div className="font-bold text-[15px]">Basic Information</div>
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs mb-0 pb-0">Job Title</FormLabel>
                            <FormDescription className="mt-0 pt-0">This is displayed name for your job.</FormDescription>
                            <FormControl>
                                <Input
                                    placeholder="shadcn"
                                    {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Category</FormLabel>
                            <FormDescription>You can manage category in you App Setting.</FormDescription>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {jobCategory.map(x => (
                                        <SelectItem key={x} value={x}>{x}</SelectItem>
                                    ))}

                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Job Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a job type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {employmentType.map(x => (
                                        <SelectItem key={x} value={x}>{x}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="font-bold text-[15px] pt-8">Hiring Location</div>
                <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Country</FormLabel>
                            <FormControl>
                                <LocationSelector
                                    onCountryChange={(country) => {
                                        setCountryName(country?.name || '')
                                        form.setValue(field.name, [country?.name || '', stateName || ''])
                                    }}
                                    onStateChange={(state) => {
                                        setStateName(state?.name || '')
                                        form.setValue(field.name, [form.getValues(field.name)?.[0] ?? '', state?.name ?? ''])
                                    }}
                                    defaultValue={field.value?.filter((v): v is string => v !== undefined)}
                                />
                            </FormControl>
                            <FormDescription>If your country has states, it will be appear after selecting country</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs mb-0 pb-0">City</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder=""
                                    {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />
                <div className="font-bold text-[15px] pt-8">Remote Options</div>
                <FormField
                    control={form.control}
                    name="remoteOption"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Is this job remote friendly?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a option" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {remoteOptions.map(x => (
                                        <SelectItem key={x} value={x}>{x}</SelectItem>
                                    ))}

                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {(form.watch("remoteOption") && form.watch("remoteOption") !== "No Remote") &&
                    <ChildForm>
                        <>
                            <FormField
                                control={form.control}
                                name="countryResidence"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-xs">Required country residence?</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a option" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={'Yes'}>{'Yes'}</SelectItem>
                                                <SelectItem value={'No'}>{'No'}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.watch("countryResidence") === "Yes" &&
                                <ChildForm>
                                    <FormField
                                        control={form.control}
                                        name="countryListResidence"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="space-y-1 text-xs">Countries
                                                    <span className="text-muted-foreground ml-2">
                                                        (Required)
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <MultiSelect
                                                        options={countryData}
                                                        onValueChange={(value) => { form.setValue('countryListResidence', value) }}
                                                        defaultValue={selectedCountryResidence}
                                                        placeholder="Select countries"
                                                        variant="default"
                                                        animation={2}
                                                        maxCount={8}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </ChildForm>
                            }
                        </>
                    </ChildForm>
                }
                <div className="font-bold text-[15px] pt-8">Salary or wage</div>
                <FormField
                    control={form.control}
                    name="displaySalary"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Dispaly</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a job type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={'Not Shown'}>{'Not Shown'}</SelectItem>
                                    <SelectItem value={'Fixed Amount'}>{'Fixed Amount'}</SelectItem>
                                    <SelectItem value={'Range'}>{'Range'}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {(form.watch("displaySalary") && form.watch("displaySalary") !== "Not Shown") &&
                    <ChildForm>
                        <>
                            {form.watch("displaySalary") === "Fixed Amount" &&
                                <FormField
                                    control={form.control}
                                    name="salaryAmount"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel className="text-xs mb-0 pb-0">Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} value={field.value ?? ""}
                                                    onChange={(e) => {
                                                        if (e.target.value === '') return field.onChange(undefined);
                                                        field.onChange(Number(e.target.value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                            }
                            {form.watch("displaySalary") === "Range" &&
                                <>

                                    <FormField
                                        control={form.control}
                                        name="minimumAmount"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-xs mb-0 pb-0">Minimum Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="maximumAmount"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel className="text-xs mb-0 pb-0">Maximum Amount</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="number"
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            }
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="text-xs mb-0 pb-0">Currency</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="USD"
                                                {...field} />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                        </>
                    </ChildForm>
                }
                <div className="mt-5">

                    <Button className="mt-5" type="submit">Save</Button>
                </div>
            </form>
        </Form>
    )
}