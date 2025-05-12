// lib/messageUtils.ts
export function generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  export function createMessageSignature(message: any): string {
    // Создаем уникальную подпись сообщения на основе его содержимого
    const role = message.role || '';
    const content = message.content || '';
    const createdAt = message.createdAt || new Date().toISOString();
    const attachments = message.experimental_attachments || message.attachments || [];
    
    // Формируем сжатое представление вложений
    const attachmentsSignature = attachments.map((att: any) => 
      `${att.name || ''}|${att.contentType || ''}|${att.url || ''}`
    ).join(',');
    
    return `${role}|${content}|${createdAt.substring(0, 16)}|${attachmentsSignature}`;
  }
  
  // Хранилище уже обработанных сообщений
  const processedMessages = new Map<string, boolean>();
  
  export function isMessageProcessed(message: any): boolean {
    const messageId = message.messageId;
    if (messageId && processedMessages.has(messageId)) {
      return true;
    }
    
    const signature = createMessageSignature(message);
    if (processedMessages.has(signature)) {
      return true;
    }
    
    return false;
  }
  
  // Очистка старых записей, чтобы избежать утечек памяти
  export function cleanupOldMessages(): void {
    // Оставляем только последние 100 записей
    const keys = Array.from(processedMessages.keys());
    if (keys.length > 100) {
      const keysToRemove = keys.slice(0, keys.length - 100);
      keysToRemove.forEach(key => processedMessages.delete(key));
    }
  }
  
  // Запускаем периодическую очистку
  setInterval(cleanupOldMessages, 5 * 60 * 1000); // Каждые 5 минут