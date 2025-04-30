
import { useEffect } from "react";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { UpcomingRenewals } from "@/components/dashboard/UpcomingRenewals";
import { useAppContext } from "@/context/AppContext";

const Dashboard = () => {
  const { getStats, getUpcomingRenewals, recalculateStatus } = useAppContext();
  
  // Recalculate member statuses when dashboard loads
  useEffect(() => {
    recalculateStatus();
  }, [recalculateStatus]);
  
  const stats = getStats();
  const renewals = getUpcomingRenewals(14); // Get renewals for next 14 days

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome to FitLife Membership Tracker
        </p>
      </div>

      <DashboardSummary stats={stats} />

      <UpcomingRenewals renewals={renewals} />
      
    </div>
  );
};

export default Dashboard;
