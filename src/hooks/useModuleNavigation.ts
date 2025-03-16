import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, retryableQuery } from '../lib/supabase';
import { Module, UserProgress } from '../types/database';

interface ModuleCache {
  [key: string]: {
    data: Module;
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PREFETCH_DELAY = 1000; // Delay before prefetching adjacent modules
const moduleCache: ModuleCache = {};

export function useModuleNavigation(courseId: string | undefined, initialModuleId: string | undefined) {
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [nextModule, setNextModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefetchTimeoutRef = useRef<NodeJS.Timeout>();

  // Cache module data
  const cacheModule = useCallback((module: Module) => {
    moduleCache[module.id] = {
      data: module,
      timestamp: Date.now()
    };
  }, []);

  // Get module from cache or fetch
  const getModule = useCallback(async (moduleId: string): Promise<Module | null> => {
    const cached = moduleCache[moduleId];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const { data, error } = await retryableQuery(() => 
      supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single()
    );

    if (error || !data) {
      console.error('Error fetching module:', error);
      return null;
    }

    cacheModule(data);
    return data;
  }, [cacheModule]);

  // Prefetch adjacent modules
  const prefetchAdjacentModules = useCallback(async (currentIndex: number) => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    prefetchTimeoutRef.current = setTimeout(async () => {
      const prevModule = modules[currentIndex - 1];
      const nextModule = modules[currentIndex + 1];

      if (prevModule) await getModule(prevModule.id);
      if (nextModule) {
        const next = await getModule(nextModule.id);
        if (next) setNextModule(next);
      }
    }, PREFETCH_DELAY);
  }, [modules, getModule]);

  // Navigate to module
  const navigateToModule = useCallback(async (moduleId: string) => {
    setTransitioning(true);
    
    try {
      const module = await getModule(moduleId);
      if (!module) {
        setError('Failed to load module content');
        return;
      }

      const currentIndex = modules.findIndex(m => m.id === moduleId);
      setCurrentModule(module);
      prefetchAdjacentModules(currentIndex);
      setError(null);
    } catch (error) {
      console.error('Error navigating to module:', error);
      setError('Failed to load module content');
    } finally {
      setTransitioning(false);
    }
  }, [modules, getModule, prefetchAdjacentModules]);

  // Initialize modules
  useEffect(() => {
    const initializeModules = async () => {
      if (!courseId) return;

      setLoading(true);
      setError(null);

      try {
        const { data: moduleData, error: moduleError } = await retryableQuery(() =>
          supabase
            .from('modules')
            .select(`
              *,
              user_progress (*)
            `)
            .eq('course_id', courseId)
            .eq('status', 'published')
            .order('order_number')
        );

        if (moduleError) throw moduleError;
        if (!moduleData?.length) throw new Error('No modules found');

        setModules(moduleData);

        // Set initial module and cache it
        const initialModule = moduleData.find(m => m.id === initialModuleId) || moduleData[0];
        cacheModule(initialModule);
        setCurrentModule(initialModule);

        // Prefetch next module
        const currentIndex = moduleData.findIndex(m => m.id === initialModule.id);
        if (currentIndex < moduleData.length - 1) {
          const next = moduleData[currentIndex + 1];
          cacheModule(next);
          setNextModule(next);
        }

        // Set progress
        const progressData = moduleData.flatMap(module => 
          module.user_progress.filter(p => p.completed)
        );
        setProgress(progressData);
      } catch (error) {
        console.error('Error initializing modules:', error);
        setError('Failed to load course content');
      } finally {
        setLoading(false);
      }
    };

    initializeModules();

    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [courseId, initialModuleId, cacheModule]);

  return {
    modules,
    currentModule,
    nextModule,
    progress,
    loading,
    transitioning,
    error,
    navigateToModule
  };
}