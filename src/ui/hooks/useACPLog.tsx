"use client";

import { createContext, useContext, useReducer, useCallback, useMemo, type ReactNode } from "react";

/**
 * ACP Event types for logging communication
 */
export type ACPEventType =
  | "session_create"
  | "session_update"
  | "delegate_payment"
  | "session_complete";

export type ACPEventStatus = "pending" | "success" | "error";

export interface ACPEvent {
  id: string;
  type: ACPEventType;
  timestamp: Date;
  status: ACPEventStatus;
  method: "POST" | "GET" | "PUT";
  endpoint: string;
  requestSummary: string | undefined;
  responseSummary: string | undefined;
  duration: number | undefined;
  statusCode: number | undefined;
}

interface ACPLogState {
  events: ACPEvent[];
  isActive: boolean;
}

type ACPLogAction =
  | { type: "ADD_EVENT"; event: ACPEvent }
  | { type: "UPDATE_EVENT"; id: string; updates: Partial<ACPEvent> }
  | { type: "CLEAR" }
  | { type: "SET_ACTIVE"; isActive: boolean };

const initialState: ACPLogState = {
  events: [],
  isActive: false,
};

function acpLogReducer(state: ACPLogState, action: ACPLogAction): ACPLogState {
  switch (action.type) {
    case "ADD_EVENT":
      return {
        ...state,
        events: [...state.events, action.event],
        isActive: true,
      };
    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.id ? { ...event, ...action.updates } : event
        ),
      };
    case "CLEAR":
      return initialState;
    case "SET_ACTIVE":
      return { ...state, isActive: action.isActive };
    default:
      return state;
  }
}

interface ACPLogContextType {
  state: ACPLogState;
  logEvent: (
    type: ACPEventType,
    method: "POST" | "GET" | "PUT",
    endpoint: string,
    requestSummary?: string
  ) => string;
  completeEvent: (
    id: string,
    status: ACPEventStatus,
    responseSummary?: string,
    statusCode?: number
  ) => void;
  clear: () => void;
}

const ACPLogContext = createContext<ACPLogContextType | null>(null);

export function ACPLogProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(acpLogReducer, initialState);

  const logEvent = useCallback(
    (
      type: ACPEventType,
      method: "POST" | "GET" | "PUT",
      endpoint: string,
      requestSummary?: string
    ) => {
      const id = `acp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const event: ACPEvent = {
        id,
        type,
        timestamp: new Date(),
        status: "pending",
        method,
        endpoint,
        requestSummary: requestSummary ?? undefined,
        responseSummary: undefined,
        duration: undefined,
        statusCode: undefined,
      };
      dispatch({ type: "ADD_EVENT", event });
      return id;
    },
    []
  );

  const completeEvent = useCallback(
    (id: string, status: ACPEventStatus, responseSummary?: string, statusCode?: number) => {
      const timestampStr = id.split("_")[1];
      const startTime = timestampStr ? parseInt(timestampStr, 10) : Date.now();
      const duration = Date.now() - startTime;

      dispatch({
        type: "UPDATE_EVENT",
        id,
        updates: {
          status,
          responseSummary: responseSummary ?? undefined,
          statusCode: statusCode ?? undefined,
          duration,
        },
      });
    },
    []
  );

  const clear = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ state, logEvent, completeEvent, clear }),
    [state, logEvent, completeEvent, clear]
  );

  return <ACPLogContext.Provider value={contextValue}>{children}</ACPLogContext.Provider>;
}

export function useACPLog() {
  const context = useContext(ACPLogContext);
  if (!context) {
    throw new Error("useACPLog must be used within ACPLogProvider");
  }
  return context;
}
