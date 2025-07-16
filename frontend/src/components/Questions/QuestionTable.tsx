import React from "react";
import { Table, Button, Popconfirm, Space, Tag } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { QuestionSerializer } from "../../types/question.type";
import { useTranslation } from "react-i18next";

interface Props {
  data: QuestionSerializer[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAddAnswer: (id: number) => void;
  loading: boolean;
  onTableChange?: () => void;
}

const QuestionTable: React.FC<Props> = ({
  data,
  onEdit,
  onDelete,
  loading,
  onTableChange,
  onAddAnswer,
}) => {
  const { t } = useTranslation("question");

  const columns: ColumnsType<QuestionSerializer> = [
    { title: t("id"), dataIndex: "id", key: "id" },
    {
      title: t("subject_id"),
      key: "subject",
      render: (_, record) => (
        <Tag color="blue">{record.subject?.name || t("unknown")}</Tag>
      ),
    },
    {
      title: t("question_text"),
      dataIndex: "question_text",
      key: "question_text",
      render: (text) => (
        <div style={{ whiteSpace: "pre-wrap", maxWidth: 300 }}>{text}</div>
      ),
    },
    {
      title: t("question_type"),
      dataIndex: "question_type",
      key: "question_type",
      render: (type) => <Tag>{t(type)}</Tag>,
    },
    { title: t("points"), dataIndex: "points", key: "points" },
    {
      title: t("difficulty_level"),
      dataIndex: "difficulty_level",
      key: "difficulty_level",
      render: (lvl) => (
        <Tag
          color={lvl === "hard" ? "red" : lvl === "medium" ? "orange" : "green"}
        >
          {t(lvl)}
        </Tag>
      ),
    },
    {
      title: t("version"),
      dataIndex: "version",
      key: "version",
    },
    {
      title: t("status"),
      key: "is_active",
      render: (_, record) => (
        <Tag color={record.is_active ? "green" : "red"}>
          {record.is_active ? t("active") : t("inactive")}
        </Tag>
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
          <Button
            icon={<PlusCircleOutlined />}
            onClick={() => onAddAnswer(record.id)}
          />
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
      onChange={onTableChange}
    />
  );
};

export default QuestionTable;
