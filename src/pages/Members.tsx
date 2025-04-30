
import { MembersTable } from "@/components/members/MembersTable";
import { useAppContext } from "@/context/AppContext";
import { Spinner } from "@/components/Spinner";

const Members = () => {
  const { members, loading, error } = useAppContext();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading members</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }
  
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
