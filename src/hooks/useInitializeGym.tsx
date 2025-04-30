
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useInitializeGym = () => {
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initializeGym = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Check if membership plans already exist
        const { data: existingPlans, error: plansError } = await supabase
          .from('membership_plans')
          .select('id')
          .limit(1);
          
        if (plansError) {
          throw plansError;
        }
        
        // If there are no plans, create default ones
        if (!existingPlans || existingPlans.length === 0) {
          const defaultPlans = [
            {
              name: "Monthly",
              duration_months: 1,
              amount: 1500,
              description: "Standard monthly membership with access to all facilities."
            },
            {
              name: "Quarterly",
              duration_months: 3,
              amount: 4000,
              description: "Quarterly membership with a small discount."
            },
            {
              name: "Half-yearly",
              duration_months: 6,
              amount: 7500,
              description: "Six-month membership with better savings."
            },
            {
              name: "Annual",
              duration_months: 12,
              amount: 14000,
              description: "Annual membership with maximum savings and premium benefits."
            }
          ];
          
          const { error: insertError } = await supabase
            .from('membership_plans')
            .insert(defaultPlans);
            
          if (insertError) {
            throw insertError;
          }
          
          console.log("Default membership plans created successfully");
        }
        
        setInitialized(true);
      } catch (error) {
        console.error("Error initializing gym data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeGym();
  }, [user]);
  
  return { initialized, isLoading };
};
