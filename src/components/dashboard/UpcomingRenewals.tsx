
import { Member } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate, formatIndianRupee, getRenewalStatusText } from "@/lib/utils";
import { CalendarX, ArrowRightCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface UpcomingRenewalsProps {
  renewals: Member[];
}

export function UpcomingRenewals({ renewals }: UpcomingRenewalsProps) {
  if (!renewals.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Renewals</CardTitle>
          <CardDescription>Members with subscriptions renewing soon</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarX className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600">No upcoming renewals</p>
          <p className="text-sm text-gray-500 mt-1">All memberships are active</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Upcoming Renewals</CardTitle>
            <CardDescription>Members with subscriptions renewing soon</CardDescription>
          </div>
          <Link to="/members">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              View All <ArrowRightCircle className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renewals.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.membershipPlan.name}</TableCell>
                <TableCell>{formatDate(member.subscriptionEndDate)}</TableCell>
                <TableCell>
                  <span className={`status-pill status-${member.status.toLowerCase()}`}>
                    {getRenewalStatusText(member.subscriptionEndDate)}
                  </span>
                </TableCell>
                <TableCell>{formatIndianRupee(member.membershipPlan.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
