
import { MemberForm } from "@/components/members/MemberForm";

const AddMember = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Member</h1>
        <p className="text-gray-500 mt-1">
          Register a new gym member and create subscription
        </p>
      </div>
      
      <MemberForm mode="create" />
    </div>
  );
};

export default AddMember;
