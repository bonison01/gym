
import React, { createContext, useContext, ReactNode } from 'react';
import { Member, MembershipPlan, Payment, MemberStatus, PaymentMethod, PaymentStatus } from '@/types';
import { getDashboardStats } from '@/lib/mockData';
import { useRealTimeMembers } from '@/hooks/useRealTimeMembers';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

interface AppContextProps {
  members: Member[];
  plans: MembershipPlan[];
  addMember: (member: Omit<Member, 'id' | 'status' | 'paymentHistory' | 'subscriptionEndDate'>) => Promise<any>;
  updateMember: (member: Member) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  getMember: (id: string) => Member | undefined;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<any>;
  recalculateStatus: () => void;
  getUpcomingRenewals: (days: number) => Member[];
  getStats: () => ReturnType<typeof getDashboardStats>;
  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    members, 
    plans, 
    loading, 
    error, 
    addMember: addRealTimeMember,
    updateMember: updateRealTimeMember,
    deleteMember: deleteRealTimeMember,
    addPayment: addRealTimePayment
  } = useRealTimeMembers();

  const addMember = async (memberData: Omit<Member, 'id' | 'status' | 'paymentHistory' | 'subscriptionEndDate'>) => {
    try {
      const result = await addRealTimeMember(memberData);
      
      toast({ 
        title: "Member Added", 
        description: `${memberData.name} has been added successfully.`
      });
      
      return result;
    } catch (error: any) {
      toast({ 
        title: "Error Adding Member", 
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateMember = async (updatedMember: Member) => {
    try {
      await updateRealTimeMember(updatedMember);
      
      toast({ 
        title: "Member Updated", 
        description: `${updatedMember.name}'s information has been updated.`
      });
    } catch (error: any) {
      toast({ 
        title: "Error Updating Member", 
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const memberToDelete = members.find(m => m.id === id);
      await deleteRealTimeMember(id);
      
      if (memberToDelete) {
        toast({ 
          title: "Member Deleted", 
          description: `${memberToDelete.name} has been removed from the system.`
        });
      }
    } catch (error: any) {
      toast({ 
        title: "Error Deleting Member", 
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const getMember = (id: string) => {
    return members.find(member => member.id === id);
  };

  const addPayment = async (paymentData: Omit<Payment, 'id'>) => {
    try {
      const result = await addRealTimePayment(paymentData);
      
      toast({ 
        title: "Payment Recorded", 
        description: `Payment of ₹${paymentData.amount} has been recorded successfully.`
      });
      
      return result;
    } catch (error: any) {
      toast({ 
        title: "Error Recording Payment", 
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
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
    // This is now handled by the database with real-time updates
    console.log("Status recalculation now happens automatically with real-time updates");
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
    // Calculate real statistics from actual data instead of using mock data
    const now = new Date();
    const activeMembers = members.filter(m => m.status === MemberStatus.ACTIVE).length;
    const expiringSoon = members.filter(m => m.status === MemberStatus.EXPIRING_SOON).length;
    const expired = members.filter(m => m.status === MemberStatus.EXPIRED).length;
    
    // Calculate monthly revenue (payments made this month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = members.reduce((total, member) => {
      const paymentsThisMonth = member.paymentHistory.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate >= startOfMonth && paymentDate <= now;
      });
      
      const memberRevenue = paymentsThisMonth.reduce((sum, payment) => sum + payment.amount, 0);
      return total + memberRevenue;
    }, 0);
    
    return {
      totalMembers: members.length,
      activeMembers,
      expiringSoon,
      expired,
      monthlyRevenue
    };
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
        getStats,
        loading,
        error
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
