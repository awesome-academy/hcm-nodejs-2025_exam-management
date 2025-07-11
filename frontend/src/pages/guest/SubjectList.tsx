import React from "react";
import { List, Card, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { useSubjects } from "../../hooks/useSubjects";
import { useNavigate } from "react-router-dom";
import "../../styles/SubjectList.css";

const SubjectList: React.FC = () => {
  const { subjects, loading } = useSubjects();
  const { t } = useTranslation("subject");
  const navigate = useNavigate();

  return (
    <div className="subject-list-container">
      <h2>{t("subject_list")}</h2>
      <Spin spinning={loading}>
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={subjects}
          renderItem={(item) => (
            <List.Item>
              <Card
                cover={
                  item.image_url ? (
                    <img
                      alt="subject"
                      src={item.image_url}
                      className="subject-card-image"
                    />
                  ) : (
                    <div className="subject-card-placeholder">
                      {t("no_image")}
                    </div>
                  )
                }
                actions={[
                  <button
                    key="view"
                    className="subject-view-button"
                    onClick={() => navigate(`/subjects/${item.id}`)}
                  >
                    {t("view_detail")}
                  </button>,
                ]}
              >
                <h3 className="subject-title">{item.name}</h3>
              </Card>
            </List.Item>
          )}
        />
      </Spin>
    </div>
  );
};

export default SubjectList;
