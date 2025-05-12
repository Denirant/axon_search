// lib/resetPassword.ts

import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import nodemailer from 'nodemailer';

// Генерация случайного 6-значного кода
export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Сохранение кода восстановления в базе данных
export async function saveResetCode(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const user = await prisma.User.findUnique({
      where: { email },
    });

    if (!user) {
      // Для безопасности не сообщаем, что пользователь не найден
      return { success: false, message: 'Если указанная почта зарегистрирована, на неё будет отправлен код восстановления' };
    }

    const resetCode = generateResetCode();
    const expiryMinutes = parseInt(process.env.RESET_CODE_EXPIRY_MINUTES || '30', 10);
    const resetExpires = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await prisma.User.update({
      where: { email },
      data: {
        resetPasswordCode: resetCode,
        resetPasswordExpires: resetExpires,
      },
    });

    // Отправка кода на почту
    await sendResetCodeEmail(email, resetCode);

    return { 
      success: true, 
      message: 'Код для сброса пароля отправлен на указанную почту' 
    };
  } catch (error) {
    console.error('Error saving reset code:', error);
    return { 
      success: false, 
      message: 'Произошла ошибка при обработке запроса' 
    };
  }
}

// Проверка кода восстановления
export async function verifyResetCode(email: string, code: string): Promise<{ valid: boolean; message: string }> {
  try {
    const user = await prisma.User.findUnique({
      where: { email },
    });

    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      return { valid: false, message: 'Неверный код подтверждения' };
    }

    if (user.resetPasswordExpires < new Date()) {
      return { valid: false, message: 'Срок действия кода истек' };
    }

    if (user.resetPasswordCode !== code) {
      return { valid: false, message: 'Неверный код подтверждения' };
    }

    return { valid: true, message: 'Код подтверждения верен' };
  } catch (error) {
    console.error('Error verifying reset code:', error);
    return { valid: false, message: 'Произошла ошибка при проверке кода' };
  }
}

// Обновление пароля
export async function updatePassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const user = await prisma.User.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, message: 'Пользователь не найден' };
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.User.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetPasswordCode: null,
        resetPasswordExpires: null,
      },
    });

    return { success: true, message: 'Пароль успешно обновлен' };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, message: 'Произошла ошибка при обновлении пароля' };
  }
}

// Отправка письма с кодом восстановления
async function sendResetCodeEmail(email: string, code: string): Promise<void> {
  // Для локальной разработки используем тестовый SMTP сервер
  // В продакшене замените на реальный SMTP сервер
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'denirant26@gmail.com',
      pass: 'yfsq trrk oxaq ipqw',
    },
  });


  const mailOptions = {
    from: '"AxonAI" <noreply@axonai.com>',
    to: email,
    subject: 'Код для восстановления пароля',
    text: `Ваш код для восстановления пароля: ${code}. Код действителен в течение 30 минут.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Восстановление пароля</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <div style="background-color: #4c66ea; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">AxonAI</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 25px;">
            <h2 style="color: #333333; margin-top: 0; font-size: 21px; font-weight: 600;">Восстановление пароля</h2>
            <p style="color: #555555; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">Вы запросили восстановление пароля для вашей учетной записи AxonAI. Используйте код ниже для завершения процесса.</p>
            
            <p style="color: #777777; font-size: 14px; margin-bottom: 8px;">Ваш код подтверждения:</p>
            <div style="background-color: #f2f4ff; border: 1px solid #e0e5ff; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 25px;">
              <span style="font-size: 28px; font-weight: 700; letter-spacing: 5px; color: #4c66ea;">${code}</span>
            </div>
            
            <p style="color: #555555; font-size: 15px; line-height: 1.5; margin-bottom: 5px;">Код действителен в течение <strong>30 минут</strong>.</p>
            <p style="color: #555555; font-size: 15px; line-height: 1.5;">Если вы не запрашивали сброс пароля, пожалуйста, проигнорируйте это письмо или свяжитесь с нашей службой поддержки.</p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f5f7ff; padding: 20px; text-align: center; border-top: 1px solid #e0e5ff;">
            <p style="color: #888888; font-size: 13px; margin: 0 0 10px 0;">Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
            <p style="color: #888888; font-size: 13px; margin: 0;">© ${new Date().getFullYear()} AxonAI. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  // В локальной разработке выведем URL для просмотра письма
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}