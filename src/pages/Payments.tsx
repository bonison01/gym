
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, formatIndianRupee } from "@/lib/utils";
import { Link } from "react-router-dom";

const Payments = () => {
  const { members } = useAppContext();
  const [timeFilter, setTimeFilter] = useState("all");
  
  // Flatten and collect all payments from all members
  const allPayments = members.flatMap(member => 
    member.paymentHistory.map(payment => ({
      ...payment,
      memberName: member.name,
      memberId: member.id
    }))
  );
  
  // Apply time filter
  let filteredPayments = [...allPayments];
  const now = new Date();
  
  if (timeFilter === "this-month") {
    filteredPayments = allPayments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    });
  } else if (timeFilter === "last-month") {
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    
    filteredPayments = allPayments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate.getMonth() === lastMonth.getMonth() && 
             paymentDate.getFullYear() === lastMonth.getFullYear();
    });
  } else if (timeFilter === "this-year") {
    filteredPayments = allPayments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate.getFullYear() === now.getFullYear();
    });
  }
  
  // Sort payments by date (newest first)
  filteredPayments.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Calculate total amount
  const totalAmount = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount, 
    0
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-gray-500 mt-1">
          Payment records for all members
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Time Period:</span>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium text-gray-500">Total</div>
          <div className="text-2xl font-bold">{formatIndianRupee(totalAmount)}</div>
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell className="font-medium">
                    <Link to={`/members/${payment.memberId}`} className="hover:underline text-fitlife-700">
                      {payment.memberName}
                    </Link>
                  </TableCell>
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
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  No payment records found for the selected time period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Payments;
