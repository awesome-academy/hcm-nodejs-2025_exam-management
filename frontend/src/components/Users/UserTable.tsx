import React from "react";
import { Table, Tag, Switch } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UserSerializer } from "../../types/user.type";
import { useTranslation } from "react-i18next";

interface Props {
  data: UserSerializer[];
  loading: boolean;
  onUpdateUserStatus: (
    userId: number,
    statusData: { is_active: boolean }
  ) => Promise<boolean>;
}

const UserTable: React.FC<Props> = ({ data, loading, onUpdateUserStatus }) => {
  const { t } = useTranslation("user");

  const handleStatusToggle = (record: UserSerializer) => {
    onUpdateUserStatus(record.id, { is_active: !record.is_active });
  };

  const columns: ColumnsType<UserSerializer> = [
    { title: t("id"), dataIndex: "id", key: "id" },
    { title: t("username"), dataIndex: "username", key: "username" },
    { title: t("email"), dataIndex: "email", key: "email" },
    { title: t("full_name"), dataIndex: "full_name", key: "full_name" },
    {
      title: t("active"),
      key: "is_active",
      render: (_, record) => (
        <Tag color={record.is_active ? "green" : "red"}>
          {record.is_active ? t("active") : t("inactive")}
        </Tag>
      ),
    },
    {
      title: t("action"),
      key: "action",
      render: (_, record) => (
        <Switch
          checked={record.is_active}
          onChange={() => handleStatusToggle(record)}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 8 }}
    />
  );
};

export default UserTable;
