
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Member, MembershipPlan, Payment, MemberStatus, PaymentMethod, PaymentStatus } from '@/types';
import { sampleMembers, membershipPlans, getDashboardStats } from '@/lib/mockData';
import { addMonths } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

interface AppContextProps {
  members: Member[];
  plans: MembershipPlan[];
  addMember: (member: Omit<Member, 'id' | 'status' | 'paymentHistory' | 'subscriptionEndDate'>) => void;
  updateMember: (member: Member) => void;
  deleteMember: (id: string) => void;
  getMember: (id: string) => Member | undefined;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  recalculateStatus: () => void;
  getUpcomingRenewals: (days: number) => Member[];
  getStats: () => ReturnType<typeof getDashboardStats>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [members, setMembers] = useState<Member[]>(sampleMembers);
  const [plans] = useState<MembershipPlan[]>(membershipPlans);
  const { toast } = useToast();

  const addMember = (memberData: Omit<Member, 'id' | 'status' | 'paymentHistory' | 'subscriptionEndDate'>) => {
    // Create initial payment
    const initialPayment: Payment = {
      id: uuidv4(),
      memberId: uuidv4(), // Temporary ID, will be replaced
      amount: memberData.membershipPlan.amount,
      date: memberData.joinDate,
      method: memberData.paymentMethod || PaymentMethod.CASH, // Use enum value with fallback
      status: PaymentStatus.PAID, // Use enum value
      notes: 'Initial membership payment'
    };

    // Calculate end date based on plan duration
    const subscriptionEndDate = addMonths(
      memberData.joinDate,
      memberData.membershipPlan.durationMonths
    );

    // Determine status
    const now = new Date();
    let status = MemberStatus.ACTIVE;
    if (subscriptionEndDate < now) {
      status = MemberStatus.EXPIRED;
    } else if (subscriptionEndDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      status = MemberStatus.EXPIRING_SOON;
    }

    // Create new member
    const newMember: Member = {
      ...memberData,
      id: uuidv4(),
      status,
      subscriptionEndDate,
      paymentHistory: [initialPayment]
    };

    // Fix the memberId in the payment to match the new member's id
    newMember.paymentHistory[0].memberId = newMember.id;

    setMembers(prev => [...prev, newMember]);
    toast({ 
      title: "Member Added", 
      description: `${newMember.name} has been added successfully.`
    });

    return newMember;
  };

  const updateMember = (updatedMember: Member) => {
    setMembers(prev => 
      prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      )
    );
    toast({ 
      title: "Member Updated", 
      description: `${updatedMember.name}'s information has been updated.`
    });
  };

  const deleteMember = (id: string) => {
    const memberToDelete = members.find(m => m.id === id);
    setMembers(prev => prev.filter(member => member.id !== id));
    
    if (memberToDelete) {
      toast({ 
        title: "Member Deleted", 
        description: `${memberToDelete.name} has been removed from the system.`
      });
    }
  };

  const getMember = (id: string) => {
    return members.find(member => member.id === id);
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: uuidv4()
    };

    setMembers(prev => prev.map(member => {
      if (member.id === paymentData.memberId) {
        const updatedMember = {
          ...member,
          paymentHistory: [...member.paymentHistory, newPayment]
        };
        
        // Update subscription end date based on new payment
        updatedMember.subscriptionEndDate = addMonths(
          new Date(paymentData.date),
          member.membershipPlan.durationMonths
        );
        
        // Update member status
        updatedMember.status = calculateMemberStatus(updatedMember.subscriptionEndDate);
        
        return updatedMember;
      }
      return member;
    }));

    toast({ 
      title: "Payment Recorded", 
      description: `Payment of ₹${paymentData.amount} has been recorded successfully.`
    });
  };

  const calculateMemberStatus = (endDate: Date): MemberStatus => {
    const now = new Date();
    if (endDate < now) {
      return MemberStatus.EXPIRED;
    } else if (endDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return MemberStatus.EXPIRING_SOON;
    }
    return MemberStatus.ACTIVE;
  };

  const recalculateStatus = () => {
    setMembers(prev => prev.map(member => ({
      ...member,
      status: calculateMemberStatus(member.subscriptionEndDate)
    })));
  };

  const getUpcomingRenewals = (days: number) => {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return members.filter(member => {
      const endDate = new Date(member.subscriptionEndDate);
      return endDate >= now && endDate <= cutoffDate;
    }).sort((a, b) => 
      new Date(a.subscriptionEndDate).getTime() - new Date(b.subscriptionEndDate).getTime()
    );
  };

  const getStats = () => {
    return getDashboardStats();
  };

  return (
    <AppContext.Provider
      value={{
        members,
        plans,
        addMember,
        updateMember,
        deleteMember,
        getMember,
        addPayment,
        recalculateStatus,
        getUpcomingRenewals,
        getStats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
