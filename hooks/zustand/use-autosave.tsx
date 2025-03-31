import { Category } from "@/types/post";
import { createStore } from "zustand";

export interface AutosaveState {
  postId: string | null;
  selectedPostId: string | null;
  isLocalDBChecked: boolean;
  isUploaded: boolean;
  isUploading: boolean;
  isAutoSaved: boolean;
  isAutoSaving: boolean;
  isLoadingDraftBody: boolean;
  isLoadingDraftTitle: boolean;
  recentAutoSavedData: {
    timestamp: number;
    title: string;
    body: string;
  } | null;
  draftPostData: {
    body?: string | null;
    is_private?: boolean | null;
    released_at?: string | null;
    short_description?: string | null;
    subcategory_id: string;
    thumbnail?: string | null;
    title: string;
    url_slug: string;
  };
  categoryData: Category[] | null;
  setIsLocalDBChecked: (value: boolean) => void;
  setIsUploaded: (value: boolean) => void;
  setIsUploading: (value: boolean) => void;
  setIsAutoSaved: (value: boolean) => void;
  setIsAutoSaving: (value: boolean) => void;
  setIsLoadingDraftBody: (value: boolean) => void;
  setIsLoadingDraftTitle: (value: boolean) => void;
  setBeforeUploading: () => void;
  setBeforeModification: (postId?: string) => void;
  setRecentAutoSavedData: (
    data: Partial<AutosaveState["recentAutoSavedData"]>
  ) => void;
  setDraftPostData: (data: Partial<AutosaveState["draftPostData"]>) => void;
  setCategoryData: (data: Category[]) => void;
}

export const createAutosaveStore = (initialState?: Partial<AutosaveState>) =>
  createStore<AutosaveState>((set) => ({
    postId: null, // SSR로 저장되는 postId
    selectedPostId: null, // IndexedDB 확인한 후에만 변경됨
    isLocalDBChecked: false, // recentAutoSavedData가 local에서 가져왔을 때만 true임
    isUploaded: false,
    isUploading: false,
    isAutoSaved: false,
    isAutoSaving: false,
    isLoadingDraftBody: false,
    isLoadingDraftTitle: false,
    recentAutoSavedData: null,
    draftPostData: {
      body: null,
      is_private: false,
      released_at: new Date().toISOString(),
      short_description: null,
      subcategory_id: "524bdc55-932b-4ea5-b9f0-44fc05ec372f",
      thumbnail: null,
      title: "",
      url_slug: "",
    },
    categoryData: null,
    setIsLocalDBChecked: (value) => set({ isLocalDBChecked: value }),
    setIsUploaded: (value) => set({ isUploaded: value }),
    setIsUploading: (value) => set({ isUploading: value }),
    setIsAutoSaved: (value) => set({ isAutoSaved: value }),
    setIsAutoSaving: (value) => set({ isAutoSaving: value }),
    setIsLoadingDraftBody: (value) => set({ isLoadingDraftBody: value }),
    setIsLoadingDraftTitle: (value) => set({ isLoadingDraftTitle: value }),
    setBeforeUploading: () =>
      set({
        isUploaded: false,
        isUploading: false,
        isAutoSaved: true,
        isAutoSaving: false,
        isLocalDBChecked: false,
      }),
    setBeforeModification: (postId) =>
      set((state) => ({
        selectedPostId: postId ?? state.selectedPostId,
        isUploaded: false,
        isUploading: false,
        isAutoSaved: false,
        isAutoSaving: false,
        isLocalDBChecked: false,
      })),
    setRecentAutoSavedData: (
      data: Partial<AutosaveState["recentAutoSavedData"]> | null
    ) =>
      set((state) => ({
        isLocalDBChecked: false,
        recentAutoSavedData: data
          ? {
              timestamp: data.timestamp ?? Date.now(),
              title: data.title ?? state.recentAutoSavedData?.title ?? "",
              body: data.body ?? state.recentAutoSavedData?.body ?? "",
            }
          : null,
      })),
    setDraftPostData: (data) =>
      set((state) => ({
        draftPostData: {
          ...state.draftPostData, // 기존 상태 유지
          ...(data ?? {}), // null이면 빈 객체로 대체
        },
      })),
    setCategoryData: (data) => set({ categoryData: data }),

    ...initialState,
  }));
