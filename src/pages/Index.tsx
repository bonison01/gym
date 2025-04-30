
import { Layout } from "@/components/Layout";
import { Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Members from "@/pages/Members";
import AddMember from "@/pages/AddMember";
import MemberDetail from "@/pages/MemberDetail";
import EditMember from "@/pages/EditMember";
import Payments from "@/pages/Payments";
import NotFound from "@/pages/NotFound";

const Index = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/new" element={<AddMember />} />
        <Route path="/members/:id" element={<MemberDetail />} />
        <Route path="/members/:id/edit" element={<EditMember />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default Index;
