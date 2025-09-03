"use client";

import { createStore } from "zustand";

export interface AdminTableFilters {
  hasSummary: string;
  combine: string;
  sortBy: string;
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
  combine: "AND",
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
