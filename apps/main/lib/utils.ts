import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { redirect } from "next/navigation";
import { currentUser } from "./auth";
import { prisma } from "@repo/database"

const roleGuard = [
  {
    action: "ADD MEMBER", role: ['OWNER', 'ADMIN'],
  },
  {
    action: "CREATE JOB", role: ['OWNER', 'ADMIN'],
  },
  {
    action: "UPDATE JOB", role: ['OWNER', 'ADMIN'],
  },
  {
    action: "PUBLISH JOB", role: ['OWNER', 'ADMIN'],
  },
  {
    action: "GENERATE PREVIEW LINK", role: ['OWNER', 'ADMIN', 'INTERVIEWER']
  },
  { action: "ADD DOMAIN", role: ['OWNER'] },
  { action: "REMOVE DOMAIN", role: ['OWNER'] },
]

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateInput: Date) {
  const now = new Date();
  const pastDate = new Date(dateInput);
  const diffInMilliseconds = now.getTime() - pastDate.getTime();

  const seconds = Math.floor(diffInMilliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30.44); // average days in a month
  const years = Math.floor(months / 12);

  if (years > 0) {
    return `${years}y`;
  } else if (months > 0) {
    return `${months}m`;
  } else if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}



export async function userDetails() {
  const user = await currentUser();
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export async function organizationRoleGuard({ email, organizationId, action }: { email: string, organizationId: string, action: string }): Promise<boolean> {
  const userRole = await prisma.organizationUserRole.findFirst({
    where: {
      email: email,
      organizationId: organizationId
    }
  })
  const currentAction = roleGuard.find(x => x.action === action)
  if (!currentAction) {
    return false
  }
  if (currentAction.role.includes(userRole?.role ?? 'INTERVIEWER')) {
    return true
  }
  return false
}