import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, List, Spin, Typography, Button } from "antd";
import { useSubjects } from "../../hooks/useSubjects";
import { useTranslation } from "react-i18next";
import { EyeOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const SubjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchSubjectById, selectedSubject } = useSubjects();
  const { t } = useTranslation("subject");
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchSubjectById(Number(id));
    }
  }, [id, fetchSubjectById]);

  if (!selectedSubject) {
    return <Spin />;
  }

  return (
    <div
      className="subject-detail-container"
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      <Card
        cover={
          selectedSubject.image_url ? (
            <img
              alt="subject"
              src={selectedSubject.image_url}
              style={{ maxHeight: 300, objectFit: "cover" }}
            />
          ) : null
        }
      >
        <Title level={2}>{selectedSubject.name}</Title>
        <Paragraph>
          <strong>{t("code")}: </strong> {selectedSubject.code}
        </Paragraph>
        <Paragraph>
          <strong>{t("description")}: </strong>{" "}
          {selectedSubject.description || t("no_description")}
        </Paragraph>
      </Card>

      <div style={{ marginTop: 40 }}>
        <Title level={3}>{t("test_list_for_subject")}</Title>
        <Spin spinning={!selectedSubject.tests}>
          <List
            dataSource={selectedSubject.tests || []}
            renderItem={(test) => (
              <List.Item>
                <Card
                  title={test.title}
                  extra={
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/tests/${test.id}/do`)}
                    >
                      {t("take_test")}
                    </Button>
                  }
                  style={{ width: "100%" }}
                >
                  <Paragraph>
                    <strong>{t("created_at")}: </strong>
                    {new Date(test.created_at).toLocaleString()}
                  </Paragraph>
                </Card>
              </List.Item>
            )}
          />
        </Spin>
      </div>
    </div>
  );
};

export default SubjectDetail;
