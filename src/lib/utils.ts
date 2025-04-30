
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, differenceInDays } from "date-fns";
import { MemberStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIndianRupee(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMM yyyy');
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMM yyyy, h:mm a');
}

export function getRenewalStatusText(endDate: Date | string) {
  const date = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const today = new Date();
  const diffDays = differenceInDays(date, today);

  if (diffDays < 0) {
    return `Expired ${Math.abs(diffDays)} days ago`;
  } else if (diffDays === 0) {
    return 'Expires today';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else if (diffDays < 7) {
    return `Expires in ${diffDays} days`;
  } else {
    return `Expires on ${formatDate(date)}`;
  }
}

export function getStatusColor(status: MemberStatus) {
  switch (status) {
    case MemberStatus.ACTIVE:
      return "bg-green-100 text-green-800";
    case MemberStatus.EXPIRED:
      return "bg-red-100 text-red-800";
    case MemberStatus.EXPIRING_SOON:
      return "bg-orange-100 text-orange-800";
    case MemberStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
