
import { useEffect } from "react";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { UpcomingRenewals } from "@/components/dashboard/UpcomingRenewals";
import { useAppContext } from "@/context/AppContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { formatDate, formatIndianRupee } from "@/lib/utils";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { getStats, getUpcomingRenewals, recalculateStatus } = useAppContext();
  
  // Recalculate member statuses when dashboard loads
  useEffect(() => {
    recalculateStatus();
  }, [recalculateStatus]);
  
  const stats = getStats();
  const renewals = getUpcomingRenewals(14); // Get renewals for next 14 days
  
  // Get the last 5 payments from members
  const { members } = useAppContext();
  const recentPayments = members
    .flatMap(member => 
      member.paymentHistory.map(payment => ({
        ...payment,
        memberName: member.name,
        memberId: member.id
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome to FitLife Membership Tracker
        </p>
      </div>

      <DashboardSummary stats={stats} />

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Payments</CardTitle>
            <CardDescription>Latest membership payments</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPayments.length > 0 ? (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <Link to={`/members/${payment.memberId}`} className="font-medium text-fitlife-700 hover:underline">
                        {payment.memberName}
                      </Link>
                      <p className="text-sm text-gray-500">{formatDate(payment.date)}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatIndianRupee(payment.amount)}</div>
                      <span className={`status-pill ${
                        payment.status === "Paid" 
                          ? "status-active" 
                          : payment.status === "Pending" 
                            ? "status-pending" 
                            : "status-expired"
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Link to="/payments" className="text-sm text-fitlife-600 hover:underline">
                    View all payments →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent payments to display</p>
            )}
          </CardContent>
        </Card>

        <UpcomingRenewals renewals={renewals} />
      </div>
    </div>
  );
};

export default Dashboard;
