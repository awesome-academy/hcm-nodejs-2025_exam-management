import React from "react";
import { Modal, Form, Input, Select, Spin, InputNumber } from "antd";
import type { FormInstance } from "antd/es/form";
import { useTranslation } from "react-i18next";
import type { QuestionSerializer } from "../../types/question.type";
import type { SubjectSerializer } from "../../types/subject.type";

interface Props {
  open: boolean;
  loading: boolean;
  isEditMode: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSubmit: () => void;
  parentQuestions: QuestionSerializer[];
  subjects: SubjectSerializer[];
}

const QuestionFormModal: React.FC<Props> = ({
  open,
  loading,
  isEditMode,
  form,
  onCancel,
  onSubmit,
  parentQuestions,
  subjects,
}) => {
  const { t } = useTranslation("question");
  const { useWatch } = Form;

  const selectedSubjectId = useWatch("subject_id", form);
  const filteredParentQuestions = parentQuestions.filter(
    (q) => q.subject_id === selectedSubjectId
  );

  return (
    <Modal
      title={isEditMode ? t("edit_question") : t("add_question")}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={t("confirm")}
      cancelText={t("cancel")}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
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
            name="question_text"
            label={t("question_text")}
            rules={[{ required: true, message: t("text_required") }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="question_type"
            label={t("question_type")}
            rules={[{ required: true, message: t("type_required") }]}
          >
            <Select>
              <Select.Option value="Trắc nghiệm">
                {t("multiple_choice")}
              </Select.Option>
              <Select.Option value="Tự luận">{t("short_answer")}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="parent_question_id" label={t("parent_question_id")}>
            <Select allowClear disabled={!selectedSubjectId}>
              {filteredParentQuestions.map((q) => (
                <Select.Option key={q.id} value={q.id}>
                  #{q.id} - {q.question_text.slice(0, 40)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="points"
            label={t("points")}
            rules={[{ required: true, message: t("points_required") }]}
          >
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="difficulty_level"
            label={t("difficulty_level")}
            rules={[{ required: true, message: t("difficulty_required") }]}
          >
            <Select>
              <Select.Option value="Dễ">{t("easy")}</Select.Option>
              <Select.Option value="Trung bình">{t("medium")}</Select.Option>
              <Select.Option value="Khó">{t("hard")}</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default QuestionFormModal;
