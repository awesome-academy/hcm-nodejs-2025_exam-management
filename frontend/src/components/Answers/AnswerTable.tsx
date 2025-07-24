import React from "react";
import { Table, Button, Popconfirm, Space, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { AnswerSerializer } from "../../types/answer.type";
import { useTranslation } from "react-i18next";

interface Props {
  data: AnswerSerializer[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}
const AnswerTable: React.FC<Props> = ({ data, loading, onEdit, onDelete }) => {
  const { t } = useTranslation("answer");

  const columns: ColumnsType<AnswerSerializer> = [
    { title: t("id"), dataIndex: "id", key: "id" },
    {
      title: t("answer_text"),
      dataIndex: "answer_text",
      key: "answer_text",
      render: (text) => <div style={{ whiteSpace: "pre-wrap" }}>{text}</div>,
    },
    {
      title: t("is_correct"),
      dataIndex: "is_correct",
      key: "is_correct",
      render: (val) =>
        val === 1 || val === true ? (
          <Tag color="green">{t("correct")}</Tag>
        ) : (
          <Tag color="red">{t("incorrect")}</Tag>
        ),
    },
    {
      title: t("explanation"),
      dataIndex: "explanation",
      key: "explanation",
      render: (text) => (
        <div
          style={{
            maxWidth: 300,
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
            fontStyle: !text ? "italic" : undefined,
            color: !text ? "#999" : undefined,
          }}
        >
          {text || t("none")}
        </div>
      ),
    },
    {
      title: t("status"),
      dataIndex: "is_active",
      key: "is_active",
      render: (val) =>
        val === true ? (
          <Tag color="green">{t("active")}</Tag>
        ) : (
          <Tag color="red">{t("inactive")}</Tag>
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
      pagination={{ pageSize: 5 }}
      size="small"
    />
  );
};

export default AnswerTable;
