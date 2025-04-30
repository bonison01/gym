
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SupabaseMembershipPlan } from "@/types/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatIndianRupee } from "@/lib/utils";
import { RefreshCw, PlusCircle, Save, Trash2 } from "lucide-react";

const PricingStructures = () => {
  const [plans, setPlans] = useState<SupabaseMembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlan, setNewPlan] = useState({
    name: "",
    duration_months: 1,
    amount: 0,
    description: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .order("duration_months", { ascending: true });

      if (error) throw error;

      if (data) {
        setPlans(data as SupabaseMembershipPlan[]);
      }
    } catch (error: any) {
      console.error("Error fetching plans:", error.message);
      toast({
        title: "Error fetching plans",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newPlan.name || newPlan.duration_months < 1 || newPlan.amount <= 0) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields with valid values.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("membership_plans")
        .insert([
          {
            name: newPlan.name,
            duration_months: newPlan.duration_months,
            amount: newPlan.amount,
            description: newPlan.description || `${newPlan.name} membership plan`,
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Plan Added",
        description: `${newPlan.name} has been added successfully.`,
      });

      // Reset form and refresh plans
      setNewPlan({
        name: "",
        duration_months: 1,
        amount: 0,
        description: "",
      });
      setIsAdding(false);
      fetchPlans();
    } catch (error: any) {
      console.error("Error adding plan:", error.message);
      toast({
        title: "Error adding plan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from("membership_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Plan Deleted",
        description: `${name} has been deleted successfully.`,
      });

      // Refresh plans
      fetchPlans();
    } catch (error: any) {
      console.error("Error deleting plan:", error.message);
      toast({
        title: "Error deleting plan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing Structures</h1>
        <p className="text-gray-500 mt-1">
          Manage your membership plan pricing structures
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={fetchPlans}
          disabled={loading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button
          onClick={() => setIsAdding(!isAdding)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {isAdding ? "Cancel" : "Add New Plan"}
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Membership Plan</CardTitle>
            <CardDescription>Create a new pricing structure for memberships</CardDescription>
          </CardHeader>
          <form onSubmit={handleAddPlan}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Monthly, Quarterly"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    step="1"
                    value={newPlan.duration_months}
                    onChange={(e) => setNewPlan({ ...newPlan, duration_months: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="100"
                    value={newPlan.amount}
                    onChange={(e) => setNewPlan({ ...newPlan, amount: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the benefits of this plan"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Plan
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length > 0 ? (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.duration_months} {plan.duration_months === 1 ? 'month' : 'months'}</TableCell>
                  <TableCell>{formatIndianRupee(plan.amount)}</TableCell>
                  <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id, plan.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                  {loading ? "Loading plans..." : "No membership plans found. Add one to get started."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PricingStructures;
