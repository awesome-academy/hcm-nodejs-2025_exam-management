import React from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Spin,
  Switch,
  Row,
  Col,
} from "antd";
import type { FormInstance } from "antd/es/form";
import type { SubjectSerializer } from "../../types/subject.type";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  loading: boolean;
  isEditMode: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: () => void;
  subjects: SubjectSerializer[];
  questionStats: { easy: number; medium: number; hard: number };
  onSubjectChange?: (subjectId: number) => void;
}

const TestFormModal: React.FC<Props> = ({
  open,
  loading,
  isEditMode,
  form,
  onCancel,
  onSubmit,
  subjects,
  questionStats,
  onSubjectChange,
}) => {
  const { t } = useTranslation("test");

  return (
    <Modal
      title={isEditMode ? t("edit_test") : t("add_test")}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={t("confirm")}
      cancelText={t("cancel")}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changedValues) => {
            if ("subject_id" in changedValues) {
              const newSubjectId = changedValues.subject_id;
              onSubjectChange?.(newSubjectId);
            }
          }}
        >
          <Form.Item
            name="subject_id"
            label={t("subject_id")}
            rules={[{ required: true, message: t("subject_required") }]}
          >
            <Select placeholder={t("select_subject")}>
              {subjects.map((subject) => (
                <Select.Option key={subject.id} value={subject.id}>
                  #{subject.id} - {subject.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label={t("title")}
            rules={[{ required: true, message: t("title_required") }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label={t("description")}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="time_limit"
            label={t("time_limit")}
            rules={[{ required: true, message: t("time_limit_required") }]}
          >
            <InputNumber min={1} max={300} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="passing_score"
            label={t("passing_score")}
            rules={[
              { required: true, message: t("passing_score_required") },
              {
                type: "number",
                min: 0,
                max: 100,
                message: t("passing_score_range"),
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} addonAfter="%" />
          </Form.Item>

          {/* Easy question */}
          <Form.Item
            name="easy_question_count"
            label={
              <>
                {t("easy_question_count")}
                <span style={{ marginLeft: 8, color: "#888" }}>
                  ({t("available")}: {questionStats.easy})
                </span>
              </>
            }
            rules={[
              { type: "number", min: 0 },
              {
                validator: (_, value) =>
                  value > questionStats.easy
                    ? Promise.reject(
                        new Error(
                          t("not_enough_easy_questions", {
                            count: questionStats.easy,
                          })
                        )
                      )
                    : Promise.resolve(),
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              max={questionStats.easy}
            />
          </Form.Item>

          {/* Medium question */}
          <Form.Item
            name="medium_question_count"
            label={
              <>
                {t("medium_question_count")}
                <span style={{ marginLeft: 8, color: "#888" }}>
                  ({t("available")}: {questionStats.medium})
                </span>
              </>
            }
            rules={[
              { type: "number", min: 0 },
              {
                validator: (_, value) =>
                  value > questionStats.medium
                    ? Promise.reject(
                        new Error(
                          t("not_enough_medium_questions", {
                            count: questionStats.medium,
                          })
                        )
                      )
                    : Promise.resolve(),
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              max={questionStats.medium}
            />
          </Form.Item>

          {/* Hard question */}
          <Form.Item
            name="hard_question_count"
            label={
              <>
                {t("hard_question_count")}
                <span style={{ marginLeft: 8, color: "#888" }}>
                  ({t("available")}: {questionStats.hard})
                </span>
              </>
            }
            rules={[
              { type: "number", min: 0 },
              {
                validator: (_, value) =>
                  value > questionStats.hard
                    ? Promise.reject(
                        new Error(
                          t("not_enough_hard_questions", {
                            count: questionStats.hard,
                          })
                        )
                      )
                    : Promise.resolve(),
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              max={questionStats.hard}
            />
          </Form.Item>

          {/* Tổng số câu phải > 0 */}
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) =>
              prev.easy_question_count !== current.easy_question_count ||
              prev.medium_question_count !== current.medium_question_count ||
              prev.hard_question_count !== current.hard_question_count
            }
          >
            {() => {
              const easy = form.getFieldValue("easy_question_count") || 0;
              const medium = form.getFieldValue("medium_question_count") || 0;
              const hard = form.getFieldValue("hard_question_count") || 0;
              const total = easy + medium + hard;

              return (
                <Form.Item
                  name="__question_count_validator"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      validator: () =>
                        total === 0
                          ? Promise.reject(
                              new Error(t("question_count_invalid"))
                            )
                          : Promise.resolve(),
                    },
                  ]}
                >
                  <div style={{ display: "none" }} />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="is_published"
                label={t("is_published")}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="is_latest"
                label={t("is_latest")}
                valuePropName="checked"
                initialValue={true}
              >
                <Switch disabled={isEditMode} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
};

export default TestFormModal;
