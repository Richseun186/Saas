import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  activeSessionId: string | null;
  activeTermId: string | null;
  selectedClassId: string | null;
  selectedSubjectId: string | null;
  
  setActiveSession: (id: string) => void;
  setActiveTerm: (id: string) => void;
  setSelectedClass: (id: string) => void;
  setSelectedSubject: (id: string) => void;
  clearSelection: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeSessionId: null,
      activeTermId: null,
      selectedClassId: null,
      selectedSubjectId: null,

      setActiveSession: (id) => set({ activeSessionId: id }),
      setActiveTerm: (id) => set({ activeTermId: id }),
      setSelectedClass: (id) => set({ selectedClassId: id, selectedSubjectId: null }), // Reset subject when class changes
      setSelectedSubject: (id) => set({ selectedSubjectId: id }),
      clearSelection: () => set({ selectedClassId: null, selectedSubjectId: null }),
    }),
    {
      name: "gradesync-storage", // unique name for localStorage key
    }
  )
);
