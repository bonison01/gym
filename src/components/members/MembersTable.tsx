
import { useState } from "react";
import { Member, MemberStatus } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatDate, formatIndianRupee } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";

interface MembersTableProps {
  members: Member[];
}

export function MembersTable({ members }: MembersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter members based on search and status
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.phone.includes(searchQuery);
    
    if (filterStatus === "all") {
      return matchesSearch;
    }
    
    return matchesSearch && member.status.toLowerCase() === filterStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2 relative">
          <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search members..."
            className="pl-9 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select 
            value={filterStatus} 
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Link to="/members/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </Link>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <p className="text-gray-500">No members found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{member.name}</p>
                      <p className="text-sm text-gray-500">{member.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(member.joinDate)}</TableCell>
                  <TableCell>{member.membershipPlan.name}</TableCell>
                  <TableCell>{formatDate(member.subscriptionEndDate)}</TableCell>
                  <TableCell>
                    <span className={`status-pill status-${member.status.toLowerCase().replace(' ', '-')}`}>
                      {member.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatIndianRupee(member.membershipPlan.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/members/${member.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
