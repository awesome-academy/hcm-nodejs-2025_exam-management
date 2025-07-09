import React from "react";
import { Table, Button, Popconfirm, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { SubjectSerializer } from "../../types/subject.type";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";

interface Props {
  data: SubjectSerializer[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  loading: boolean;
}

const SubjectTable: React.FC<Props> = ({ data, onEdit, onDelete, loading }) => {
  const { t } = useTranslation("subject");

  const columns: ColumnsType<SubjectSerializer> = [
    {
      title: t("id"),
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("code"),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t("description"),
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <div
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxWidth: 250,
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: t("image"),
      dataIndex: "image_url",
      key: "image_url",
      render: (url: string) =>
        url ? (
          <img
            src={url}
            alt="subject"
            style={{
              width: 60,
              height: 40,
              objectFit: "cover",
              borderRadius: 6,
            }}
          />
        ) : (
          <i style={{ color: "#aaa" }}>{t("no_image")}</i>
        ),
    },

    {
      title: t("actions"),
      key: "actions",
      render: (_: SubjectSerializer, record: SubjectSerializer) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => onEdit(record.id)} />
          <Popconfirm
            title={t("delete_confirm")}
            onConfirm={() => onDelete(record.id)}
            okText={t("yes")}
            cancelText={t("no")}
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
      pagination={{ pageSize: 4 }}
      loading={loading}
    />
  );
};

export default SubjectTable;
