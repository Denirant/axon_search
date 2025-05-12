// lib/imageUtils.ts

/**
 * Конвертирует File в base64 строку
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  /**
   * Сжимает изображение для уменьшения размера
   */
  export const compressImage = async (file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Определяем новые размеры с сохранением пропорций
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * maxHeight / height);
              height = maxHeight;
            }
          }
          
          // Создаем canvas и сжимаем изображение
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Не удалось получить контекст canvas'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Конвертируем в base64
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => {
          reject(new Error('Ошибка загрузки изображения'));
        };
      };
      reader.onerror = () => {
        reject(new Error('Ошибка чтения файла'));
      };
    });
  };
  
  /**
   * Проверяет тип и размер файла изображения
   */
  export const validateImage = (file: File, maxSizeMB = 5): { valid: boolean; error?: string } => {
    // Проверка типа файла
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Недопустимый формат файла. Поддерживаются: JPG, PNG, GIF, WEBP' 
      };
    }
    
    // Проверка размера файла (в байтах)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { 
        valid: false, 
        error: `Размер файла превышает ${maxSizeMB} МБ` 
      };
    }
    
    return { valid: true };
  };