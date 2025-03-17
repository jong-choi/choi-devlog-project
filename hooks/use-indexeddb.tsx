import { useCallback, useEffect, useState } from "react";

const DB_NAME = "markdown-blog";
const DB_VERSION = 1;

interface DBResponse {
  status: "ok";
}

/**
 * IndexedDB를 쉽게 사용할 수 있도록 도와주는 커스텀 훅
 * @template T - 저장할 데이터 타입
 * @param {string} storeName - IndexedDB에서 사용할 스토어 이름
 * @returns IndexedDB 조작을 위한 함수 모음
 */
export function useIndexedDB<T>(storeName: string) {
  const [db, setDb] = useState<IDBDatabase | null>(null);

  /** @returns {DOMException} 데이터베이스가 초기화되지 않았을 때 발생하는 예외 */
  const notInitializedException = useCallback(
    () => new DOMException("DB is not initialized", "InvalidStateError"),
    []
  );

  /** @returns {DOMException} 알 수 없는 IndexedDB 오류 예외 */
  const unknownException = useCallback(
    () => new DOMException("Unknown IndexedDB error", "UnknownError"),
    []
  );

  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, {
          keyPath: "id",
          autoIncrement: true,
        });
        if (store && !store.indexNames.contains("timestamp")) {
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      }
    };

    request.onsuccess = () => {
      setDb(request.result);
    };

    request.onerror = () => {
      console.error("IndexedDB Error:", request.error ?? unknownException());
    };
  }, [storeName, unknownException]);

  /**
   * 데이터를 IndexedDB에 추가
   * @param {T} data - 추가할 데이터
   * @returns {Promise<{ status: "ok"; id: IDBValidKey }>} 저장된 ID와 상태 반환
   *
   * @example
   * ```tsx
   * const added = await addData({ title: "First Post", body: "Hello World!", saved_at: new Date().toISOString() });
   * console.log("Added Post ID:", added.id); // 'Added Post ID: 1'
   * ```
   */
  const addData = (data: T): Promise<{ status: "ok"; id: IDBValidKey }> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(notInitializedException());
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      request.onsuccess = () => resolve({ status: "ok", id: request.result });
      request.onerror = () => reject(request.error ?? unknownException());
    });
  };

  /**
   * 특정 ID의 데이터를 가져옴
   * @param {number} id - 가져올 데이터의 ID
   * @returns {Promise<{ status: "ok"; data?: T }>} 데이터가 존재하면 반환, 없으면 undefined
   *
   * @example
   * ```tsx
   * const post = await getData(1);
   * console.log(post.data); // { id: 1, title: "First Post", body: "Hello World!", saved_at: "2025-03-16T12:00:00Z" }
   * ```
   */
  const getData = (id: number): Promise<{ status: "ok"; data?: T }> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(notInitializedException());
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () =>
        resolve({ status: "ok", data: request.result as T | undefined });
      request.onerror = () => reject(request.error ?? unknownException());
    });
  };

  /**
   * 모든 데이터를 가져옴
   * @returns {Promise<{ status: "ok"; data: T[] }>} 모든 데이터를 배열 형태로 반환
   * @example
   * ```tsx
   * const posts = await getAllData();
   * console.log(posts.data); // [{ id: 1, title: "First Post", body: "Hello World!", saved_at: "2025-03-16T12:00:00Z" }]
   * ```
   */
  const getAllData = (): Promise<{ status: "ok"; data: T[] }> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(notInitializedException());
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () =>
        resolve({ status: "ok", data: request.result as T[] });
      request.onerror = () => reject(request.error ?? unknownException());
    });
  };

  /**
   * 특정 ID의 데이터를 삭제
   * @param {number} id - 삭제할 데이터의 ID
   * @returns {Promise<DBResponse>} 삭제 성공 여부 반환
   */
  const deleteData = (id: number): Promise<DBResponse> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(notInitializedException());
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve({ status: "ok" });
      request.onerror = () => reject(request.error ?? unknownException());
    });
  };

  /**
   * IndexedDB의 특정 스토어의 모든 데이터를 삭제
   * @returns {Promise<DBResponse>} 삭제 성공 여부 반환
   */
  const clearStore = (): Promise<DBResponse> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(notInitializedException());
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve({ status: "ok" });
      request.onerror = () => reject(request.error ?? unknownException());
    });
  };

  /**
   * 특정 인덱스를 기준으로 데이터를 가져옴 (커서 사용)
   * @param {string} key - 검색할 인덱스 키
   * @param {"next" | "prev"} direction - 정렬 방향
   * @returns {Promise<{ status: "ok"; data: T[] }>} 필터링된 데이터 목록 반환
   *
   * @example
   * ```tsx
   * // "timestamp" 인덱스를 기준으로 최신순으로 데이터 가져오기
   * const recentPosts = await getDataByOpenCursor("timestamp", "prev");
   * console.log(recentPosts.data); // [{ id: 3, title: "Latest Post", body: "Newest content", saved_at: "2025-03-16T12:10:00Z" }]
   * ```
   */
  const getDataByOpenCursor = (
    key: string,
    direction: "next" | "prev"
  ): Promise<{ status: "ok"; data: T[] }> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(notInitializedException());
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);

      if (!store.indexNames.contains(key)) {
        return reject(
          new DOMException(`Index "${key}" does not exist`, "InvalidKey")
        );
      }

      const index = store.index(key);
      const request = index.openCursor(null, direction);

      const results: T[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          results.push(cursor.value as T);
          cursor.continue();
        } else {
          resolve({ status: "ok", data: results });
        }
      };

      request.onerror = () => reject(request.error ?? unknownException());
    });
  };

  return {
    storeName: db?.objectStoreNames || "",
    addData,
    getData,
    getAllData,
    deleteData,
    clearStore,
    getDataByOpenCursor,
  };
}
