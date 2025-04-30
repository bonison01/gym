
import { v4 as uuidv4 } from 'uuid';
import { Member, MembershipPlan, Payment, PaymentMethod, PaymentStatus, MemberStatus } from '@/types';
import { addDays, addMonths, subDays, subMonths } from 'date-fns';

// Sample membership plans
export const membershipPlans: MembershipPlan[] = [
  {
    id: uuidv4(),
    name: 'Basic',
    durationMonths: 1,
    amount: 1200,
    description: 'Access to gym floor and basic equipment'
  },
  {
    id: uuidv4(),
    name: 'Premium',
    durationMonths: 3,
    amount: 3200,
    description: 'Access to all gym facilities including classes'
  },
  {
    id: uuidv4(),
    name: 'Elite',
    durationMonths: 6,
    amount: 6000,
    description: 'Full access including personal training sessions'
  },
  {
    id: uuidv4(),
    name: 'Annual',
    durationMonths: 12,
    amount: 11000,
    description: 'Best value with full access and premium perks'
  }
];

// Generate sample payment for a member
const generatePayments = (memberId: string, joinDate: Date, plan: MembershipPlan, count = 1): Payment[] => {
  const payments: Payment[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const paymentDate = i === 0 ? joinDate : addMonths(joinDate, i * plan.durationMonths);
    
    // Only include payments in the past
    if (paymentDate <= today) {
      payments.push({
        id: uuidv4(),
        memberId,
        amount: plan.amount,
        date: paymentDate,
        method: [PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.UPI][Math.floor(Math.random() * 3)] as PaymentMethod,
        status: PaymentStatus.PAID,
        notes: i === 0 ? 'Initial membership payment' : 'Renewal payment'
      });
    }
  }
  
  return payments;
};

// Determine member status based on subscription end date
const getMemberStatus = (endDate: Date): MemberStatus => {
  const today = new Date();
  const sevenDaysFromNow = addDays(today, 7);
  
  if (endDate < today) {
    return MemberStatus.EXPIRED;
  } else if (endDate <= sevenDaysFromNow) {
    return MemberStatus.EXPIRING_SOON;
  } else {
    return MemberStatus.ACTIVE;
  }
};

// Generate sample members
export const generateMembers = (count = 20): Member[] => {
  const members: Member[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const plan = membershipPlans[Math.floor(Math.random() * membershipPlans.length)];
    const joinDate = subMonths(today, Math.floor(Math.random() * 24)); // Join date up to 2 years ago
    const paymentCount = Math.ceil((today.getTime() - joinDate.getTime()) / (plan.durationMonths * 30 * 24 * 60 * 60 * 1000)) + 1;
    const payments = generatePayments(uuidv4(), joinDate, plan, paymentCount);
    
    // Calculate the end date based on join date and last payment
    let subscriptionEndDate;
    if (payments.length > 0) {
      const lastPaymentDate = payments[payments.length - 1].date;
      subscriptionEndDate = addMonths(lastPaymentDate, plan.durationMonths);
    } else {
      subscriptionEndDate = addMonths(joinDate, plan.durationMonths);
    }
    
    // Generate some expired, some expiring soon, and some active
    if (i < count * 0.2) {
      subscriptionEndDate = subDays(today, Math.floor(Math.random() * 30)); // Expired
    } else if (i < count * 0.4) {
      subscriptionEndDate = addDays(today, Math.floor(Math.random() * 7)); // Expiring soon
    }
    
    const status = getMemberStatus(subscriptionEndDate);
    
    const memberId = uuidv4();
    members.push({
      id: memberId,
      name: [
        'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Deepika Singh', 'Rajesh Verma',
        'Sneha Gupta', 'Vikram Rao', 'Ananya Reddy', 'Kiran Joshi', 'Neha Malhotra',
        'Sanjay Kapoor', 'Pooja Desai', 'Arjun Nair', 'Divya Mehra', 'Suresh Iyer',
        'Monica Choudhary', 'Ajay Saxena', 'Ritu Agarwal', 'Naveen Menon', 'Kavita Tiwari',
        'Prakash Sharma', 'Meera Khanna', 'Vivek Singhania', 'Sunita Patel', 'Ravi Krishnan'
      ][i % 25],
      email: `member${i + 1}@example.com`,
      phone: `+91 ${Math.floor(Math.random() * 900000000) + 9000000000}`,
      joinDate,
      membershipPlan: plan,
      subscriptionEndDate,
      paymentHistory: payments,
      status
    });
  }
  
  return members;
};

export const sampleMembers = generateMembers();

export const getDashboardStats = () => {
  const stats = {
    totalMembers: sampleMembers.length,
    activeMembers: sampleMembers.filter(m => m.status === MemberStatus.ACTIVE).length,
    expiringSoon: sampleMembers.filter(m => m.status === MemberStatus.EXPIRING_SOON).length,
    expired: sampleMembers.filter(m => m.status === MemberStatus.EXPIRED).length,
    monthlyRevenue: 0
  };
  
  // Calculate revenue for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  sampleMembers.forEach(member => {
    member.paymentHistory.forEach(payment => {
      const paymentDate = new Date(payment.date);
      if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
        stats.monthlyRevenue += payment.amount;
      }
    });
  });
  
  return stats;
};
