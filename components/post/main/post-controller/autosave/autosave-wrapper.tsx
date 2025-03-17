"use client";

import { useEffect } from "react";
import { useAutosave } from "@/providers/autosave-store-provider";
import { useIndexedDB } from "@/hooks/use-indexeddb";
import { useShallow } from "zustand/react/shallow";

export default function AutoSaveWrapper({ postId }: { postId: string }) {
  const {
    selectedPostId,
    isAutoSaving,
    recentAutoSavedData,
    isUploaded,
    setBeforeUploading,
    setRecentAutoSavedData,
    setBeforeModification,
  } = useAutosave(
    useShallow((state) => ({
      selectedPostId: state.selectedPostId,
      isAutoSaving: state.isAutoSaving,
      recentAutoSavedData: state.recentAutoSavedData,
      isUploaded: state.isUploaded,
      setBeforeUploading: state.setBeforeUploading,
      setRecentAutoSavedData: state.setRecentAutoSavedData,
      setBeforeModification: state.setBeforeModification,
    }))
  );

  // useIndexedDB 훅을 사용하여 "postId" 스토어를 조작
  const { storeName, addData, getDataByOpenCursor, clearStore } = useIndexedDB<{
    timestamp: number;
    title: string;
    body: string;
  }>(postId);

  // 마운트 시 IndexedDB에서 데이터 불러오기
  useEffect(() => {
    if (!storeName) return;
    if (postId === selectedPostId) return; // 이미 초기화 되었으면 반응없음
    const loadFromIndexedDB = async () => {
      try {
        setBeforeModification(postId); // 이곳에서 selectedPostId를 주입하여 db가 초기화되었음을 알린다.

        const recentPosts = await getDataByOpenCursor("timestamp", "prev");
        const savedData = recentPosts?.data?.[0];
        if (savedData) setRecentAutoSavedData(savedData);
      } catch (error) {
        console.error("Failed to load from IndexedDB:", error);
      }
    };

    loadFromIndexedDB();
  }, [
    getDataByOpenCursor,
    postId,
    selectedPostId,
    setBeforeModification,
    setRecentAutoSavedData,
    storeName,
  ]);

  // isAutoSaving이 true가 되면 IndexedDB에 저장
  useEffect(() => {
    console.log(isAutoSaving);
    if (isAutoSaving && recentAutoSavedData) {
      const saveToIndexedDB = async () => {
        try {
          await addData({
            timestamp: recentAutoSavedData.timestamp,
            title: recentAutoSavedData.title,
            body: recentAutoSavedData.body,
          });
          setBeforeUploading();
        } catch (error) {
          console.error("Failed to save to IndexedDB:", error);
        }
      };

      saveToIndexedDB();
    }
  }, [isAutoSaving, recentAutoSavedData, postId, addData, setBeforeUploading]);

  useEffect(() => {
    if (isUploaded && postId === selectedPostId) {
      const clearIndexedDBStore = async () => {
        try {
          await clearStore();
        } catch (error) {
          console.error("Failed to save to IndexedDB:", error);
        }
      };
      clearIndexedDBStore();
    }
  }, [clearStore, isUploaded, postId, selectedPostId]);

  return null;
}
