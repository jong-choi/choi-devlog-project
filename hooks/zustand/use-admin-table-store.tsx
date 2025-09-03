"use client";

import { createStore } from "zustand";

export interface AdminTableFilters {
  hasSummary: string;
  sortBy: "created_at" | "summaryExistence" | string;
  sortOrder: string;
}

export interface AdminTableState {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  filters: AdminTableFilters;
  setFilters: (filters: Partial<AdminTableFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: AdminTableFilters = {
  hasSummary: "",
  sortBy: "created_at",
  sortOrder: "desc",
};

export const createAdminTableStore = () =>
  createStore<AdminTableState>((set) => ({
    loading: true,
    setLoading: (loading) => set({ loading }),
    filters: initialFilters,
    setFilters: (newFilters) =>
      set((state) => ({ filters: { ...state.filters, ...newFilters } })),
    resetFilters: () => set({ filters: initialFilters }),
  }));
