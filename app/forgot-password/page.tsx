// app/forgot-password/page.tsx

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Восстановление пароля — AxonAI',
  description: 'Восстановление доступа к вашему аккаунту AxonAI',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}