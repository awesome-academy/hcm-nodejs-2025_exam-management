import React from "react";
import { Table, Button, Popconfirm, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TestSerializer } from "../../types/test.type";
import { useTranslation } from "react-i18next";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface Props {
  data: TestSerializer[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}

const TestTable: React.FC<Props> = ({ data, onEdit, onDelete, loading }) => {
  const { t } = useTranslation("test");

  const columns: ColumnsType<TestSerializer> = [
    { title: t("id"), dataIndex: "id", key: "id" },
    {
      title: t("subject"),
      render: (_, record) => (
        <Tag color="blue">{record.subject?.name || t("unknown")}</Tag>
      ),
    },
    { title: t("title"), dataIndex: "title", key: "title" },
    { title: t("time_limit"), dataIndex: "time_limit", key: "time_limit" },
    {
      title: t("passing_score"),
      dataIndex: "passing_score",
      key: "passing_score",
    },
    {
      title: t("total_questions"),
      dataIndex: "question_count",
      key: "question_count",
    },
    {
      title: t("version"),
      dataIndex: "version",
      key: "version",
    },
    {
      title: t("status"),
      dataIndex: "is_latest",
      key: "is_latest",
      render: (val) =>
        val ? (
          <Tag color="green">{t("latest")}</Tag>
        ) : (
          <Tag color="red">{t("old_version")}</Tag>
        ),
    },
    {
      title: t("is_published"),
      dataIndex: "is_published",
      key: "is_published",
      render: (val) =>
        val ? (
          <Tag color="green">{t("published")}</Tag>
        ) : (
          <Tag>{t("draft")}</Tag>
        ),
    },
    {
      title: t("action"),
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onEdit(record.id)} />
          <Popconfirm
            title={t("delete_confirm")}
            onConfirm={() => onDelete(record.id)}
            okText={t("confirm")}
            cancelText={t("cancel")}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 6 }}
    />
  );
};

export default TestTable;
