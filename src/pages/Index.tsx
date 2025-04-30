
import { Layout } from "@/components/Layout";
import { Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Members from "@/pages/Members";
import AddMember from "@/pages/AddMember";
import MemberDetail from "@/pages/MemberDetail";
import EditMember from "@/pages/EditMember";
import Payments from "@/pages/Payments";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Index = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/new" element={<AddMember />} />
          <Route path="/members/:id" element={<MemberDetail />} />
          <Route path="/members/:id/edit" element={<EditMember />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Index;
