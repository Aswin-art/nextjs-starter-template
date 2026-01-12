"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Hook that debounces a value.
 * Returns the debounced value that only updates after the specified delay.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 *
 * useEffect(() => {
 *   // This runs 300ms after the user stops typing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that returns a debounced version of the provided callback.
 * The callback will only be executed after the specified delay since the last call.
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced callback function
 *
 * @example
 * const debouncedSave = useDebouncedCallback((value: string) => {
 *   saveToServer(value);
 * }, 1000);
 *
 * <input onChange={(e) => debouncedSave(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 500,
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
}

/**
 * Hook that returns a debounced callback with immediate cancel capability.
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Object with debounced callback and cancel function
 */
export function useDebouncedCallbackWithCancel<
  T extends (...args: unknown[]) => unknown,
>(
  callback: T,
  delay = 500,
): {
  debouncedCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: (...args: Parameters<T>) => void;
} {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  const argsRef = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    argsRef.current = null;
  }, []);

  const flush = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      callbackRef.current(...args);
    },
    [cancel],
  );

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        argsRef.current = null;
      }, delay);
    },
    [delay],
  );

  return { debouncedCallback, cancel, flush };
}
