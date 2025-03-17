import { useCallback, useEffect, useState } from "react";

const DB_NAME = "markdown-blog";
const DB_VERSION = 1;
const STORE_NAME = "posts"; // storeName을 "posts"로 고정

interface DBResponse {
  status: "ok";
}

/**
 * IndexedDB를 쉽게 사용할 수 있도록 도와주는 커스텀 훅
 * @template T - 저장할 데이터 타입
 * @returns IndexedDB 조작을 위한 함수 모음
 */
export function useIndexedDB<T>() {
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
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });

        store.createIndex("postId", "postId", { unique: false }); // postId 추가
        store.createIndex("timestamp", "timestamp", { unique: false }); // timestamp 추가
      }
    };

    request.onsuccess = () => {
      setDb(request.result);
    };

    request.onerror = () => {
      console.error("IndexedDB Error:", request.error ?? unknownException());
    };
  }, [unknownException]);

  /**
   * 데이터를 IndexedDB에 추가
   * @param {T & { postId: string; timestamp: number }} data - 추가할 데이터
   * @returns {Promise<{ status: "ok"; id: IDBValidKey }>} 저장된 ID와 상태 반환
   */
  const addData = (
    data: T & { postId: string; timestamp: number }
  ): Promise<{ status: "ok"; id: IDBValidKey }> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(notInitializedException());
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(data);
      request.onsuccess = () => resolve({ status: "ok", id: request.result });
      request.onerror = () => reject(request.error ?? unknownException());
    });
  };

  /**
   * 특정 postId에 해당하는 최신 데이터를 가져옴 (timestamp 기준 최신)
   * @param {string} postId - 조회할 postId
   * @returns {Promise<{ status: "ok"; data?: T }>} 최신 데이터 반환
   */
  const getLatestDataByPostId = (
    postId: string
  ): Promise<{ status: "ok"; data?: T }> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(notInitializedException());
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("postId");
      const range = IDBKeyRange.only(postId);
      const request = index.openCursor(range, "prev"); // 최신 데이터를 먼저 가져옴

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          resolve({ status: "ok", data: cursor.value as T });
        } else {
          resolve({ status: "ok", data: undefined });
        }
      };

      request.onerror = () => reject(request.error ?? unknownException());
    });
  };

  /**
   * 특정 postId 값을 가진 모든 데이터를 삭제
   * @param {string} postId - 삭제할 데이터의 postId 값
   * @returns {Promise<DBResponse>} 삭제 성공 여부 반환
   */
  const deleteByPostId = (postId: string): Promise<DBResponse> => {
    return new Promise((resolve, reject) => {
      if (!db) return reject(notInitializedException());

      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("postId");

      const range = IDBKeyRange.only(postId);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          store.delete(cursor.primaryKey); // 해당 데이터 삭제
          cursor.continue(); // 다음 데이터로 이동
        } else {
          resolve({ status: "ok" }); // 모든 삭제 완료
        }
      };

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
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve({ status: "ok" });
      request.onerror = () => reject(request.error ?? unknownException());
    });
  };

  return {
    isDb: !!db,
    addData,
    getLatestDataByPostId,
    deleteByPostId,
    clearStore,
  };
}
