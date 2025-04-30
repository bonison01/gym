
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { MemberForm } from "@/components/members/MemberForm";

const EditMember = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMember } = useAppContext();
  
  const member = getMember(id || "");
  
  useEffect(() => {
    if (!member) {
      navigate("/members", { replace: true });
    }
  }, [member, navigate]);
  
  if (!member) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700"
        >
          &larr; Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Member</h1>
      </div>
      
      <MemberForm mode="edit" existingMember={member} />
    </div>
  );
};

export default EditMember;
