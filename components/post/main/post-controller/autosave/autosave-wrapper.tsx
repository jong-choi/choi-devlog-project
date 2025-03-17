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

  // useIndexedDB 훅을 사용하여 "post" 스토어를 조작
  const { isDb, addData, getLatestDataByPostId, deleteByPostId } =
    useIndexedDB<{
      postId: string;
      timestamp: number;
      title: string;
      body: string;
    }>();

  // 마운트 시 IndexedDB에서 데이터 불러오기
  useEffect(() => {
    if (!isDb) return;
    if (postId === selectedPostId) return; // 이미 초기화 되었으면 반응 없음
    const loadFromIndexedDB = async () => {
      try {
        setBeforeModification(postId); // selectedPostId를 설정하여 초기화 알림

        const latestPost = await getLatestDataByPostId(postId);
        if (latestPost?.data) setRecentAutoSavedData(latestPost.data);
      } catch (error) {
        console.error("Failed to load from IndexedDB:", error);
      }
    };

    loadFromIndexedDB();
  }, [
    isDb,
    getLatestDataByPostId,
    postId,
    selectedPostId,
    setBeforeModification,
    setRecentAutoSavedData,
  ]);

  // isAutoSaving이 true가 되면 IndexedDB에 저장
  useEffect(() => {
    if (isAutoSaving && recentAutoSavedData) {
      const saveToIndexedDB = async () => {
        try {
          await addData({
            postId, // postId 필드 추가
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

  // 업로드 완료 시 해당 postId에 대한 IndexedDB 데이터 삭제
  useEffect(() => {
    if (isUploaded && postId === selectedPostId) {
      const clearIndexedDBStore = async () => {
        try {
          await deleteByPostId(postId); // 특정 postId만 삭제
        } catch (error) {
          console.error("Failed to delete from IndexedDB:", error);
        }
      };
      clearIndexedDBStore();
    }
  }, [deleteByPostId, isUploaded, postId, selectedPostId]);

  return null;
}
