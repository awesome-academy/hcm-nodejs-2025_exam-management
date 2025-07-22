import React from "react";
import UserTable from "../../components/Users/UserTable";
import { useUser } from "../../hooks/useUser";

const UserManagement: React.FC = () => {
  const { usersList, loadingUsersList, onUpdateUserStatus } = useUser();

  return (
    <UserTable
      data={usersList}
      loading={loadingUsersList}
      onUpdateUserStatus={onUpdateUserStatus}
    />
  );
};

export default UserManagement;
