
import { MembersTable } from "@/components/members/MembersTable";
import { useAppContext } from "@/context/AppContext";

const Members = () => {
  const { members } = useAppContext();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <p className="text-gray-500 mt-1">
          Manage your gym members and subscriptions
        </p>
      </div>
      
      <MembersTable members={members} />
    </div>
  );
};

export default Members;
