
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatIndianRupee } from "@/lib/utils";
import { Users, Calendar, IndianRupee, AlertCircle } from "lucide-react";

interface DashboardSummaryProps {
  stats: {
    totalMembers: number;
    activeMembers: number;
    expiringSoon: number;
    expired: number;
    monthlyRevenue: number;
  };
}

export function DashboardSummary({ stats }: DashboardSummaryProps) {
  const cards = [
    {
      title: "Total Members",
      value: stats.totalMembers,
      description: "Registered gym members",
      icon: <Users className="h-5 w-5 text-fitlife-500" />,
    },
    {
      title: "Active Members",
      value: stats.activeMembers,
      description: "Current active subscriptions",
      icon: <Users className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Expiring Soon",
      value: stats.expiringSoon,
      description: "Expiring within 7 days",
      icon: <Calendar className="h-5 w-5 text-orange-500" />,
    },
    {
      title: "Expired",
      value: stats.expired,
      description: "Subscriptions needing renewal",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
    {
      title: "Monthly Revenue",
      value: formatIndianRupee(stats.monthlyRevenue),
      description: "Current month",
      icon: <IndianRupee className="h-5 w-5 text-green-600" />,
      isAmount: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <CardDescription className="mt-1">
              {card.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
