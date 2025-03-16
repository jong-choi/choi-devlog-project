"use client";

import { useEffect } from "react";
import { useAutosave } from "@/providers/autosave-store-provider";
import { useIndexedDB } from "@/hooks/use-indexeddb";

interface AutosaveWrapperProps {
  postId?: string;
}

export default function AutosaveWrapper({ postId = "" }: AutosaveWrapperProps) {
  const {
    isAutoSaving,
    recentAutoSavedData,
    setIsAutoSaved,
    setIsAutoSaving,
    setRecentAutoSavedData,
  } = useAutosave((state) => ({
    isAutoSaving: state.isAutoSaving,
    recentAutoSavedData: state.recentAutoSavedData,
    setIsAutoSaved: state.setIsAutoSaved,
    setIsAutoSaving: state.setIsAutoSaving,
    setRecentAutoSavedData: state.setRecentAutoSavedData,
  }));

  // useIndexedDB 훅을 사용하여 "postId" 스토어를 조작
  const { addData, getDataByOpenCursor } = useIndexedDB<{
    id: string;
    timestamp: number;
    title: string;
    body: string;
  }>(postId);

  // 마운트 시 IndexedDB에서 데이터 불러오기
  useEffect(() => {
    const loadFromIndexedDB = async () => {
      try {
        const recentPosts = await getDataByOpenCursor("saved_at", "prev");
        if (recentPosts.status === "ok" && recentPosts.data) {
          setRecentAutoSavedData({
            postId,
            data: recentPosts.data[0],
          });
          setIsAutoSaved(true);
        }
      } catch (error) {
        console.error("Failed to load from IndexedDB:", error);
      }
    };

    loadFromIndexedDB();
  }, [postId, setRecentAutoSavedData, setIsAutoSaved, getDataByOpenCursor]);

  // isAutoSaving이 true가 되면 IndexedDB에 저장
  useEffect(() => {
    if (isAutoSaving && recentAutoSavedData) {
      const saveToIndexedDB = async () => {
        try {
          await addData({
            id: postId,
            timestamp: recentAutoSavedData.data.timestamp,
            title: recentAutoSavedData.data.title,
            body: recentAutoSavedData.data.body,
          });

          setIsAutoSaved(true);
          setIsAutoSaving(false);
        } catch (error) {
          console.error("Failed to save to IndexedDB:", error);
        }
      };

      saveToIndexedDB();
    }
  }, [
    isAutoSaving,
    recentAutoSavedData,
    postId,
    addData,
    setIsAutoSaved,
    setIsAutoSaving,
  ]);

  return null;
}
