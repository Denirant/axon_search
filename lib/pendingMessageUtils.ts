// lib/pendingMessageUtils.ts
export interface PendingMessage {
    content: string;
    attachments: any[];
    timestamp: number;
    processed: boolean;
}

export function savePendingMessage(content: string, attachments: any[] = []): void {
    const pendingMessage: PendingMessage = {
        content,
        attachments,
        timestamp: Date.now(),
        processed: false,
    };

    sessionStorage.setItem('pendingMessage', JSON.stringify(pendingMessage));
}

export function getPendingMessage(): PendingMessage | null {
    const stored = sessionStorage.getItem('pendingMessage');
    if (!stored) return null;

    try {
        const data = JSON.parse(stored);

        // Проверяем, является ли data объектом нашего формата
        if (typeof data === 'object' && 'content' in data) {
            return {
                content: data.content || '',
                attachments: Array.isArray(data.attachments) ? data.attachments : [],
                timestamp: data.timestamp || Date.now(),
                processed: data.processed || false,
            };
        }

        // Обратная совместимость со старым форматом
        if (typeof data === 'object' && data !== null) {
            return {
                content: typeof data.content === 'string' ? data.content : typeof data === 'string' ? data : '',
                attachments: Array.isArray(data.attachments) ? data.attachments : [],
                timestamp: Date.now(),
                processed: false,
            };
        }

        // Если это просто строка
        if (typeof data === 'string') {
            return {
                content: data,
                attachments: [],
                timestamp: Date.now(),
                processed: false,
            };
        }

        return null;
    } catch (e) {
        // Если не удалось распарсить JSON, пробуем использовать как строку
        const content = sessionStorage.getItem('pendingMessage') || '';
        return {
            content,
            attachments: [],
            timestamp: Date.now(),
            processed: false,
        };
    }
}

export function markPendingMessageAsProcessed(): void {
    const message = getPendingMessage();
    if (!message) return;

    message.processed = true;
    sessionStorage.setItem('pendingMessage', JSON.stringify(message));
}

export function clearPendingMessage(): void {
    sessionStorage.removeItem('pendingMessage');
    sessionStorage.removeItem('pendingMessageProcessing');
}

export function isPendingMessageExpired(): boolean {
    const message = getPendingMessage();
    if (!message) return true;

    // Считаем сообщение устаревшим, если прошло более 30 минут
    const expiryTime = 30 * 60 * 1000; // 30 минут
    return Date.now() - message.timestamp > expiryTime;
}
