
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Member, Payment, PaymentMethod, PaymentStatus } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatDate, formatIndianRupee, getRenewalStatusText } from "@/lib/utils";
import { Link, useParams } from "react-router-dom";
import { Calendar, IndianRupee, Trash2, UserCog } from "lucide-react";

interface MemberDetailsProps {
  member: Member;
}

export function MemberDetails({ member }: MemberDetailsProps) {
  const navigate = useNavigate();
  const { deleteMember, addPayment } = useAppContext();
  
  const sortedPayments = useMemo(() => {
    return [...member.paymentHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [member.paymentHistory]);
  
  const handleDelete = () => {
    deleteMember(member.id);
    navigate("/members");
  };
  
  const handleRenewMembership = () => {
    const newPayment: Omit<Payment, 'id'> = {
      memberId: member.id,
      amount: member.membershipPlan.amount,
      date: new Date(),
      method: PaymentMethod.CASH,
      status: PaymentStatus.PAID,
      notes: 'Membership renewal'
    };
    
    addPayment(newPayment);
  };
  
  return (
    <div className="space-y-6">
      {/* Member Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{member.name}</CardTitle>
              <CardDescription>Member since {formatDate(member.joinDate)}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/members/${member.id}/edit`}>
                <Button variant="outline" className="flex items-center gap-1">
                  <UserCog className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Member</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {member.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Contact Information</p>
            <p className="text-sm text-gray-500">Email: {member.email}</p>
            <p className="text-sm text-gray-500">Phone: {member.phone}</p>
            {member.address && (
              <p className="text-sm text-gray-500">Address: {member.address}</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Personal Details</p>
            {member.gender && (
              <p className="text-sm text-gray-500">Gender: {member.gender}</p>
            )}
            {member.age && (
              <p className="text-sm text-gray-500">Age: {member.age} years</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Membership Details</p>
            <p className="text-sm text-gray-500">
              Plan: {member.membershipPlan.name} ({member.membershipPlan.durationMonths} months)
            </p>
            <p className="text-sm text-gray-500">
              Cost: {formatIndianRupee(member.membershipPlan.amount)}
            </p>
          </div>
          
          {(member.referralCommission && member.referralCommission > 0) && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Referral Commission</p>
              <p className="text-sm text-green-600 font-semibold">
                {formatIndianRupee(member.referralCommission)}
              </p>
              <p className="text-xs text-muted-foreground">
                Earned from referrals
              </p>
            </div>
          )}
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Subscription Status</p>
            <div className="flex items-center gap-2">
              <span className={`status-pill status-${member.status.toLowerCase().replace(' ', '-')}`}>
                {member.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {getRenewalStatusText(member.subscriptionEndDate)}
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleRenewMembership}>
            <Calendar className="mr-2 h-4 w-4" />
            Renew Membership
          </Button>
        </CardFooter>
      </Card>
      
      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            Complete payment records for this member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPayments.length > 0 ? (
                sortedPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell>{formatIndianRupee(payment.amount)}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>
                      <span className={`status-pill ${
                        payment.status === "Paid" 
                          ? "status-active" 
                          : payment.status === "Pending" 
                            ? "status-pending" 
                            : "status-expired"
                      }`}>
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell>{payment.notes || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    No payment records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
