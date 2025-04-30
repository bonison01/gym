export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: Date;
  membershipPlan: MembershipPlan;
  subscriptionEndDate: Date;
  paymentHistory: Payment[];
  status: MemberStatus;
  photo?: string;
  paymentMethod?: PaymentMethod; // Add this optional field to Member type
}

export type MembershipPlan = {
  id: string;
  name: string;
  durationMonths: number;
  amount: number;
  description?: string;
}

export type Payment = {
  id: string;
  memberId: string;
  amount: number;
  date: Date;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
}

export enum PaymentMethod {
  CASH = "Cash",
  CARD = "Card",
  UPI = "UPI",
  BANK_TRANSFER = "Bank Transfer",
  OTHER = "Other"
}

export enum PaymentStatus {
  PAID = "Paid",
  PENDING = "Pending",
  FAILED = "Failed",
  REFUNDED = "Refunded"
}

export enum MemberStatus {
  ACTIVE = "Active",
  PENDING = "Pending",
  EXPIRED = "Expired",
  EXPIRING_SOON = "Expiring Soon"
}

export type DashboardStats = {
  totalMembers: number;
  activeMembers: number;
  expiringSoon: number;
  expired: number;
  monthlyRevenue: number;
}
