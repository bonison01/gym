
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Member, MembershipPlan, PaymentMethod } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatIndianRupee } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Spinner } from "@/components/Spinner";

interface MemberFormProps {
  existingMember?: Member;
  mode: "create" | "edit";
}

export function MemberForm({ existingMember, mode }: MemberFormProps) {
  const { plans, addMember, updateMember, loading, members } = useAppContext();
  const navigate = useNavigate();
  
  const [name, setName] = useState(existingMember?.name || "");
  const [email, setEmail] = useState(existingMember?.email || "");
  const [phone, setPhone] = useState(existingMember?.phone || "");
  const [address, setAddress] = useState(existingMember?.address || "");
  const [gender, setGender] = useState(existingMember?.gender || "");
  const [age, setAge] = useState(existingMember?.age?.toString() || "");
  const [referredById, setReferredById] = useState(existingMember?.referredById || "");
  const [joinDate, setJoinDate] = useState<Date>(existingMember?.joinDate || new Date());
  const [selectedPlanId, setSelectedPlanId] = useState(
    existingMember?.membershipPlan.id || plans[0]?.id || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    existingMember?.paymentMethod || PaymentMethod.CASH
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const selectedPlan = plans.find(plan => plan.id === selectedPlanId) || plans[0];
  
  // Update selectedPlanId when plans are loaded (if needed)
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (mode === "create") {
        // Create new member
        const newMember = {
          name,
          email,
          phone,
          address,
          gender,
          age: age ? parseInt(age) : undefined,
          referredById: referredById || undefined,
          joinDate,
          membershipPlan: selectedPlan as MembershipPlan,
          paymentMethod
        };
        
        await addMember(newMember);
        navigate("/members");
      } else if (existingMember) {
        // Update existing member
        const updatedMember = {
          ...existingMember,
          name,
          email,
          phone,
          address,
          gender,
          age: age ? parseInt(age) : undefined,
          paymentMethod
        };
        
        await updateMember(updatedMember);
        navigate(`/members/${existingMember.id}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading && mode === "edit") {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter member name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address"
          />
        </div>
        
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter age"
            min="1"
            max="150"
          />
        </div>
        
        {mode === "create" && (
          <>
            <div>
              <Label>Join Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !joinDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {joinDate ? format(joinDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={joinDate}
                    onSelect={(date) => date && setJoinDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="plan">Membership Plan</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {formatIndianRupee(plan.amount)} / {plan.durationMonths} month(s)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlan && (
                <p className="text-sm text-gray-500 mt-1">
                  {selectedPlan.description}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select 
                value={paymentMethod} 
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                  <SelectItem value={PaymentMethod.CARD}>Card</SelectItem>
                  <SelectItem value={PaymentMethod.UPI}>UPI</SelectItem>
                  <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                  <SelectItem value={PaymentMethod.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="referral">Referred By (Optional)</Label>
              <Select value={referredById} onValueChange={setReferredById}>
                <SelectTrigger id="referral">
                  <SelectValue placeholder="Select referring member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                The referring member will receive commission on payments
              </p>
            </div>
          </>
        )}
      </div>
      
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2">
                {mode === "create" ? "Adding..." : "Updating..."}
              </span>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
            </>
          ) : (
            mode === "create" ? "Add Member" : "Update Member"
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
