import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Spin,
  Tag,
  Button,
  Tooltip,
  Space,
} from "antd";
import { useNavigate } from "react-router-dom";
import { getAllTestSessionsAdmin } from "../../services/test_sessionService";
import type { TestSessionSerializer } from "../../types/test_session.type";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
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

  const renderStatus = (status: string) => {
    let color = "default";
    let icon = null;

    switch (status) {
      case "SUBMITTED":
        color = "green";
        icon = <CheckCircleOutlined />;
        break;
      case "IN_PROGRESS":
        color = "blue";
        icon = <ClockCircleOutlined />;
        break;
      case "PENDING":
        color = "orange";
        icon = <MinusCircleOutlined />;
        break;
      case "CANCELLED":
        color = "red";
        icon = <CloseCircleOutlined />;
        break;
    }

    return (
      <Tag
        icon={icon}
        color={color}
        style={{
          borderRadius: 20,
          fontWeight: 500,
          padding: "4px 12px",
          textTransform: "capitalize",
        }}
      >
        {t(status) || t("DEFAULT")}
      </Tag>
    );
  };

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
              render: renderStatus,
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
