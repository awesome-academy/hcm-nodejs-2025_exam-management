import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Spin,
  Button,
  Tooltip,
  Space,
  Tag,
} from "antd";
import { useNavigate } from "react-router-dom";
import { getAllTestSessionsAdmin } from "../../services/test_sessionService";
import type { TestSessionSerializer } from "../../types/test_session.type";
import { EyeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

const TestReviewList: React.FC = () => {
  const [sessions, setSessions] = useState<TestSessionSerializer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation("testList");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getAllTestSessionsAdmin();
        setSessions(res.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <Card style={{ borderRadius: 12 }}>
      <Title level={3}>{t("title")}</Title>
      <Spin spinning={loading}>
        <Table
          rowKey="id"
          dataSource={sessions}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: t("student"),
              dataIndex: ["user", "full_name"],
              key: "user",
            },
            {
              title: t("test"),
              dataIndex: ["test", "title"],
              key: "test",
            },
            {
              title: t("status"),
              dataIndex: "status",
              key: "status",
              render: (status: string) => {
                let color = "default";
                let label = status;

                switch (status) {
                  case "in_progress":
                    color = "blue";
                    label = t("in_progress");
                    break;
                  case "submitted":
                    color = "gold";
                    label = t("submitted");
                    break;
                  case "graded":
                    color = "green";
                    label = t("graded");
                    break;
                }

                return <Tag color={color}>{label}</Tag>;
              },
            },
            {
              title: t("score"),
              dataIndex: "score",
              align: "center",
              render: (score: number | null) => score ?? "-",
            },
            {
              title: t("submitted_at"),
              dataIndex: "submitted_at",
              align: "center",
              render: (value: string) =>
                value ? new Date(value).toLocaleString() : "-",
            },
            {
              title: t("action"),
              key: "action",
              align: "center",
              render: (_, record) => (
                <Space>
                  <Tooltip title={t("view_detail")}>
                    <Button
                      shape="circle"
                      type="default"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        navigate(`/suppervisor/tests/${record.id}`)
                      }
                      style={{
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        transition: "all 0.3s",
                      }}
                    />
                  </Tooltip>
                </Space>
              ),
            },
          ]}
        />
      </Spin>
    </Card>
  );
};
export default TestReviewList;
