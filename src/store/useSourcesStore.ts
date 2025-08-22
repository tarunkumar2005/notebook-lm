import { create } from 'zustand'

export interface Source {
  id: string
  type: 'pdf' | 'text' | 'url'
  content: string // cloudinary URL for PDF, text data for text, web URL for URL
  name: string
  createdAt: Date
  isIndexed: boolean
}

export interface SourcesStore {
  sources: Source[]
  addSource: (source: Source) => void
  removeSource: (id: string) => void
  clearSources: () => void
  getSourcesByType: (type: Source['type']) => Source[]
  toggleSourceIndex: (id: string) => void
}

// Storage key constant
const STORAGE_KEY = 'knowledge-sources'

// Helper to load from sessionStorage
function loadSources(): Source[] {
  if (typeof window === 'undefined') return [] // SSR safety
  
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((source: any) => ({
        ...source,
        createdAt: new Date(source.createdAt), // Revive Date object
      }))
    }
    return []
  } catch (error) {
    console.error('Failed to load sources from sessionStorage:', error)
    return []
  }
}

// Helper to save to sessionStorage
function saveSources(sources: Source[]): void {
  if (typeof window === 'undefined') return // SSR safety
  
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sources))
  } catch (error) {
    console.error('Failed to save sources to sessionStorage:', error)
  }
}

export const useSourcesStore = create<SourcesStore>()((set, get) => {
  // Load initial data from sessionStorage
  const initialSources = loadSources()

  return {
    sources: initialSources,
    
    addSource: (sourceData: Source): void => {
      const newSource: Source = {
        ...sourceData,
      }
      
      set((state: SourcesStore) => {
        const newSources = [...state.sources, newSource]
        saveSources(newSources) // Sync to sessionStorage
        return { sources: newSources }
      })
    },
    
    removeSource: (id: string): void => {
      set((state: SourcesStore) => {
        const newSources = state.sources.filter((source: Source) => source.id !== id)
        saveSources(newSources) // Sync to sessionStorage
        return { sources: newSources }
      })
    },
    
    clearSources: (): void => {
      const newSources: Source[] = []
      saveSources(newSources) // Sync to sessionStorage
      set({ sources: newSources })
    },
    
    getSourcesByType: (type: Source['type']): Source[] => {
      return get().sources.filter((source: Source) => source.type === type)
    },

    toggleSourceIndex: (id: string): void => {
      set((state: SourcesStore) => {
        const newSources = state.sources.map((source: Source) => {
          if (source.id === id) {
            return { ...source, isIndexed: !source.isIndexed }
          }
          return source
        })
        saveSources(newSources) // Sync to sessionStorage
        return { sources: newSources }
      })
    },
  }
})