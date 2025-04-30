
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addMonths } from "date-fns";
import { Member, MemberStatus, MembershipPlan, PaymentMethod } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { SupabaseGymMember, SupabaseMembershipPlan } from "@/types/supabase";

export const useRealTimeMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch membership plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('membership_plans')
          .select('*') as { data: SupabaseMembershipPlan[], error: any };
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedPlans: MembershipPlan[] = data.map((plan: SupabaseMembershipPlan) => ({
            id: plan.id,
            name: plan.name,
            durationMonths: plan.duration_months,
            amount: Number(plan.amount),
            description: plan.description,
          }));
          
          setPlans(formattedPlans);
        }
      } catch (error: any) {
        console.error("Error fetching membership plans:", error);
        setError(error.message);
      }
    };
    
    fetchPlans();
  }, []);

  // Fetch initial members data
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        
        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from('gym_members')
          .select('*') as { data: SupabaseGymMember[], error: any };
          
        if (membersError) {
          throw membersError;
        }
        
        if (membersData) {
          // Fetch payment data for each member
          const memberIds = membersData.map((m: any) => m.id);
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .in('member_id', memberIds) as { data: any[], error: any };
            
          if (paymentsError) {
            throw paymentsError;
          }
          
          // Process and format members data
          const formattedMembers: Member[] = membersData.map((member: SupabaseGymMember) => {
            const memberPlan = plans.find(p => p.id === member.membership_plan_id) || {
              id: "default",
              name: "Unknown Plan",
              durationMonths: 1,
              amount: 0
            };
            
            const memberPayments = (paymentsData || [])
              .filter((p: any) => p.member_id === member.id)
              .map((payment: any) => ({
                id: payment.id,
                memberId: payment.member_id,
                amount: Number(payment.amount),
                date: new Date(payment.date),
                method: payment.method as PaymentMethod,
                status: payment.status,
                notes: payment.notes
              }));
            
            return {
              id: member.id,
              name: member.name,
              email: member.email,
              phone: member.phone,
              joinDate: new Date(member.join_date),
              membershipPlan: memberPlan as MembershipPlan,
              subscriptionEndDate: new Date(member.subscription_end_date),
              status: member.status as MemberStatus,
              paymentMethod: member.payment_method as PaymentMethod,
              paymentHistory: memberPayments
            };
          });
          
          setMembers(formattedMembers);
        }
      } catch (error: any) {
        console.error("Error fetching members:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch members if we have plans loaded
    if (plans.length > 0) {
      fetchMembers();
    }
  }, [plans]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (plans.length === 0) return;
    
    const channel = supabase
      .channel('public:gym_members')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'gym_members' },
        (payload: any) => {
          const newMember = payload.new as SupabaseGymMember;
          const memberPlan = plans.find(p => p.id === newMember.membership_plan_id) || {
            id: "default",
            name: "Unknown Plan",
            durationMonths: 1,
            amount: 0
          };
          
          setMembers(currentMembers => [
            ...currentMembers,
            {
              id: newMember.id,
              name: newMember.name,
              email: newMember.email,
              phone: newMember.phone,
              joinDate: new Date(newMember.join_date),
              membershipPlan: memberPlan as MembershipPlan,
              subscriptionEndDate: new Date(newMember.subscription_end_date),
              status: newMember.status as MemberStatus,
              paymentMethod: newMember.payment_method as PaymentMethod,
              paymentHistory: []
            }
          ]);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'gym_members' },
        (payload: any) => {
          const updatedMember = payload.new as SupabaseGymMember;
          
          setMembers(currentMembers => 
            currentMembers.map(member => {
              if (member.id === updatedMember.id) {
                const memberPlan = plans.find(p => p.id === updatedMember.membership_plan_id) || member.membershipPlan;
                
                return {
                  ...member,
                  name: updatedMember.name,
                  email: updatedMember.email,
                  phone: updatedMember.phone,
                  joinDate: new Date(updatedMember.join_date),
                  membershipPlan: memberPlan,
                  subscriptionEndDate: new Date(updatedMember.subscription_end_date),
                  status: updatedMember.status as MemberStatus,
                  paymentMethod: updatedMember.payment_method as PaymentMethod,
                };
              }
              return member;
            })
          );
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'gym_members' },
        (payload: any) => {
          setMembers(currentMembers => 
            currentMembers.filter(member => member.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [plans]);

  // Function to add a new member
  const addMember = async (memberData: Omit<Member, 'id' | 'status' | 'paymentHistory' | 'subscriptionEndDate'>) => {
    try {
      // Calculate subscription end date
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
      
      // Create new member in Supabase
      const { data, error } = await supabase
        .from('gym_members')
        .insert({
          name: memberData.name,
          email: memberData.email,
          phone: memberData.phone,
          join_date: memberData.joinDate.toISOString(),
          membership_plan_id: memberData.membershipPlan.id,
          subscription_end_date: subscriptionEndDate.toISOString(),
          status: status,
          payment_method: memberData.paymentMethod
        })
        .select()
        .single() as { data: any, error: any };
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // Create initial payment
        const paymentData = {
          member_id: data.id,
          amount: memberData.membershipPlan.amount,
          date: memberData.joinDate.toISOString(),
          method: memberData.paymentMethod || PaymentMethod.CASH,
          status: 'Paid',
          notes: 'Initial membership payment'
        };
        
        const { error: paymentError } = await supabase
          .from('payments')
          .insert(paymentData) as { error: any };
          
        if (paymentError) {
          console.error("Error creating payment record:", paymentError);
        }
      }
      
      return data;
    } catch (error: any) {
      console.error("Error adding member:", error);
      throw error;
    }
  };

  // Function to update member
  const updateMember = async (updatedMember: Member) => {
    try {
      const { error } = await supabase
        .from('gym_members')
        .update({
          name: updatedMember.name,
          email: updatedMember.email,
          phone: updatedMember.phone,
          payment_method: updatedMember.paymentMethod
        })
        .eq('id', updatedMember.id) as { error: any };
        
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Error updating member:", error);
      throw error;
    }
  };

  // Function to delete member
  const deleteMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gym_members')
        .delete()
        .eq('id', id) as { error: any };
        
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Error deleting member:", error);
      throw error;
    }
  };

  // Function to add payment
  const addPayment = async (paymentData: Omit<any, 'id'>) => {
    try {
      // First add the payment
      const { data, error: paymentError } = await supabase
        .from('payments')
        .insert({
          member_id: paymentData.memberId,
          amount: paymentData.amount,
          date: new Date(paymentData.date).toISOString(),
          method: paymentData.method,
          status: paymentData.status,
          notes: paymentData.notes
        })
        .select()
        .single() as { data: any, error: any };
        
      if (paymentError) {
        throw paymentError;
      }
      
      // Get the member
      const member = members.find(m => m.id === paymentData.memberId);
      
      if (member) {
        // Calculate new subscription end date
        const newEndDate = addMonths(
          new Date(paymentData.date),
          member.membershipPlan.durationMonths
        );
        
        // Determine new status
        const now = new Date();
        let status = MemberStatus.ACTIVE;
        if (newEndDate < now) {
          status = MemberStatus.EXPIRED;
        } else if (newEndDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
          status = MemberStatus.EXPIRING_SOON;
        }
        
        // Update member with new end date and status
        const { error: updateError } = await supabase
          .from('gym_members')
          .update({
            subscription_end_date: newEndDate.toISOString(),
            status: status
          })
          .eq('id', paymentData.memberId) as { error: any };
          
        if (updateError) {
          console.error("Error updating member subscription:", updateError);
        }
      }
      
      return data;
    } catch (error: any) {
      console.error("Error adding payment:", error);
      throw error;
    }
  };

  return {
    members,
    plans,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    addPayment
  };
};
