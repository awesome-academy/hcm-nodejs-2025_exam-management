import {
  Card,
  Form,
  Input,
  Button,
  Divider,
  Modal,
  Avatar,
  Spin,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import type {
  ChangePasswordFormData,
  ProfileFormValues,
} from "../../types/user.type";
import "../../styles/ProfilePage.css";

const ProfilePage = () => {
  const [form] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<ChangePasswordFormData>();
  const { user, onUpdateProfile, onChangePassword } = useUser();
  const { t } = useTranslation("user");

  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    form.setFieldsValue({
      full_name: user.full_name,
      email: user.email,
      username: user.username,
    });
    setAvatarPreview(user.avatar_url || null);
  }, [user, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error(t("invalid_image_format"));
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async () => {
    setIsSubmittingProfile(true);
    try {
      const values = await form.validateFields();
      await onUpdateProfile({
        ...values,
        image: avatarFile ? [{ originFileObj: avatarFile }] : undefined,
      });
      setAvatarFile(null);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (values: ChangePasswordFormData) => {
    setIsSubmittingPassword(true);
    const success = await onChangePassword(values);
    if (success) {
      passwordForm.resetFields();
      setPasswordModalVisible(false);
      setTimeout(() => {
        navigate("/");
      }, 500);
    }

    setIsSubmittingPassword(false);
  };

  return (
    <div className="profile-container">
      <Spin spinning={isSubmittingProfile}>
        <Card title={t("profile_info")} bordered={false}>
          <Form form={form} layout="vertical" onFinish={handleProfileSubmit}>
            <div className="avatar-wrapper">
              <input
                type="file"
                accept="image/*"
                id="avatarInput"
                hidden
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatarInput">
                <Avatar
                  size={160}
                  src={avatarPreview || undefined}
                  icon={<UserOutlined />}
                  style={{ cursor: "pointer" }}
                />
              </label>
            </div>

            <Form.Item
              label={t("full_name")}
              name="full_name"
              rules={[{ required: true, message: t("full_name_required") }]}
            >
              <Input placeholder={t("enter_full_name")} />
            </Form.Item>
            <Form.Item label={t("username")} name="username">
              <Input disabled />
            </Form.Item>

            <Form.Item
              label={t("email")}
              name="email"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item style={{ textAlign: "right" }}>
              <Button type="primary" htmlType="submit">
                {t("update_profile")}
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div className="change-password-btn-wrapper">
            <Button type="dashed" onClick={() => setPasswordModalVisible(true)}>
              {t("change_password")}
            </Button>
          </div>
        </Card>
      </Spin>

      <Modal
        title={t("change_password")}
        open={isPasswordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Spin spinning={isSubmittingPassword}>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordSubmit}
          >
            <Form.Item
              label={t("current_password")}
              name="current_password"
              rules={[
                { required: true, message: t("current_password_required") },
              ]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>

            <Form.Item
              label={t("new_password")}
              name="new_password"
              rules={[
                { required: true, message: t("new_password_required") },
                { min: 6, message: t("password_min_length") },
              ]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>

            <Form.Item style={{ textAlign: "right" }}>
              <Button
                onClick={() => setPasswordModalVisible(false)}
                style={{ marginRight: 8 }}
              >
                {t("cancel")}
              </Button>
              <Button type="primary" htmlType="submit">
                {t("change_password")}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default ProfilePage;
