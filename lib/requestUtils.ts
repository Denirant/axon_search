// utils/requestUtils.ts
/**
 * Кэш для хранения идентичных запросов
 */
const requestCache = new Map<string, Promise<any>>();

/**
 * Выполняет запрос с защитой от дублирования
 */
export async function idempotentFetch(
  url: string, 
  options: RequestInit = {},
  cacheKey?: string
): Promise<Response> {
  const key = cacheKey || `${options.method || 'GET'}-${url}`;
  
  // Если запрос уже выполняется, возвращаем его Promise
  if (requestCache.has(key)) {
    return requestCache.get(key) as Promise<Response>;
  }
  
  // Создаем идемпотентный ключ
  const idempotencyKey = crypto.randomUUID();
  
  // Добавляем заголовок идемпотентности
  const headers = new Headers(options.headers);
  headers.set('X-Idempotency-Key', idempotencyKey);
  headers.set('X-Request-Id', idempotencyKey);
  
  // Создаем запрос
  const fetchPromise = fetch(url, {
    ...options,
    headers,
  }).finally(() => {
    // Удаляем запрос из кэша после завершения
    requestCache.delete(key);
  });
  
  // Сохраняем Promise запроса в кэш
  requestCache.set(key, fetchPromise);
  
  return fetchPromise;
}