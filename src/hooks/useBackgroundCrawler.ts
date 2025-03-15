import { useEffect, useRef } from 'react';
import { InitializationService } from '../services/InitializationService';
import { supabase } from '../lib/supabase';

const CRAWL_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export function useBackgroundCrawler() {
  const initServiceRef = useRef<InitializationService>(new InitializationService());

  useEffect(() => {
    const initialize = async () => {
      try {
        await initServiceRef.current.initialize();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    // Run initialization immediately
    initialize();

    // Set up interval for next crawl
    const intervalId = setInterval(async () => {
      try {
        await initServiceRef.current.initialize();
      } catch (error) {
        console.error('Background crawl error:', error);
      }
    }, CRAWL_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);
} 