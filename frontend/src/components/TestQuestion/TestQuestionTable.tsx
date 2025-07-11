import React from "react";
import { Table, Button, Popconfirm, Space, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { TestQuestionSerializer } from "../../types/test_question.type";
import { useTranslation } from "react-i18next";

interface Props {
  data: TestQuestionSerializer[];
  loading: boolean;
  onEdit: (questionId: number) => void;
  onDelete: (questionId: number) => void;
}

const TestQuestionTable: React.FC<Props> = ({ data, loading, onDelete }) => {
  const { t } = useTranslation("test_question");

  const columns: ColumnsType<TestQuestionSerializer> = [
    { title: t("question_id"), dataIndex: "question_id", key: "question_id" },
    {
      title: t("question"),
      key: "question",
      render: (_, record) => (
        <div>
          #{record.question_id} -{" "}
          {record.question?.question_text || t("no_question_text")}
        </div>
      ),
    },
    {
      title: t("order_number"),
      dataIndex: "order_number",
      key: "order_number",
    },
    {
      title: t("status"),
      key: "status",
      render: (_, record) => {
        const isActive = record.question?.is_active;
        return (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? t("active") : t("inactive")}
          </Tag>
        );
      },
    },
    {
      title: t("action"),
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title={t("delete_confirm")}
            onConfirm={() => onDelete(record.question_id)}
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
      rowKey={(record) => `${record.test_id}-${record.question_id}`}
      loading={loading}
      size="small"
      pagination={false}
    />
  );
};

export default TestQuestionTable;
