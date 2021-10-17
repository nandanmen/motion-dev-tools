import React from "react";
import { motion } from "framer-motion";
import { produce } from "immer";
import _ from "lodash";

import { styled } from "./stitches";
import { PropsForm } from "./props-form";

type State = "ACTIVE" | "WAIT_REPLAY" | "IDLE" | "WAIT";

type ToolState = {
  state: State;
  uuid?: string;
  name?: string;
  props?: Record<string, any>; // things like `animate`, `initial`, `variants`, etc.
};

type Event =
  | {
      type: "CLICK";
      uuid: string;
      name: string;
    }
  | {
      type: "SET_PROPS";
      props: Record<string, any>;
    }
  | {
      type: "UPDATE_PROPS";
      path: string;
      value: unknown;
    }
  | {
      type: "CLOSE";
    }
  | {
      type: "REPLAY";
    }
  | {
      type: "ANIMATION_DONE";
    };

type SendFunction = (event: Event) => void;

type ToolContext = ToolState & { send: SendFunction };

const Context = React.createContext<ToolContext | undefined>(undefined);

function isActiveState(state: string): boolean {
  return ["ACTIVE", "WAIT_REPLAY"].includes(state);
}

export const MotionDevTool = ({ children }: { children: React.ReactNode }) => {
  const [toolState, setToolState] = React.useState<ToolState>({
    state: "IDLE",
  });

  const send = (event: Event) => {
    switch (toolState.state) {
      case "IDLE": {
        switch (event.type) {
          case "CLICK": {
            setToolState({ state: "WAIT", uuid: event.uuid, name: event.name });
            return;
          }
          default:
            return;
        }
      }
      case "WAIT": {
        switch (event.type) {
          case "SET_PROPS": {
            setToolState({
              ...toolState,
              state: "ACTIVE",
              props: event.props,
            });
            return;
          }
          default:
            return;
        }
      }
      case "ACTIVE": {
        switch (event.type) {
          case "CLOSE": {
            setToolState({ state: "IDLE" });
            return;
          }
          case "SET_PROPS": {
            setToolState({
              ...toolState,
              state: "ACTIVE",
              props: event.props,
            });
            return;
          }
          case "UPDATE_PROPS": {
            setToolState((state) =>
              produce(state, (draft) => {
                _.set(draft, `props.${event.path}`, event.value);
              })
            );
            return;
          }
          case "REPLAY": {
            setToolState((state) => ({
              ...state,
              state: "WAIT_REPLAY",
            }));
            return;
          }
          default:
            return;
        }
      }
      case "WAIT_REPLAY": {
        switch (event.type) {
          case "ANIMATION_DONE": {
            setToolState((state) => ({
              ...state,
              state: "ACTIVE",
            }));
            return;
          }
          default:
            return;
        }
      }
      default:
        return;
    }
  };

  React.useEffect(() => {
    function onClick(evt: MouseEvent) {
      const el = evt.target as HTMLElement;
      const id = el?.dataset.id;
      if (!id) return;
      send({ type: "CLICK", uuid: id, name: el.dataset.name as string });
    }

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <Context.Provider value={{ ...toolState, send }}>
      {children}
      {isActiveState(toolState.state) && (
        <PropsForm
          props={toolState.props ?? {}}
          onReplay={() => send({ type: "REPLAY" })}
          onChange={(path, value) =>
            send({ type: "UPDATE_PROPS", path, value })
          }
        />
      )}
    </Context.Provider>
  );
};

const ComponentName = styled("p", {
  marginBottom: "16px",
});

const Debug = styled("div", {
  background: "$gray6",
  padding: "8px",
  borderRadius: "4px",
  fontFamily: "SF Mono",
});

const ControlPanel = styled(motion.div, {
  position: "fixed",
  top: "8px",
  left: "8px",
  padding: "20px",
  borderRadius: "8px",
  border: "2px solid $colors$gray8",
  fontFamily: "SF Mono, monospace",
});

export const useMotionDevToolContext = (): ToolContext => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(
      "No dev tool context found - Did you wrap your component tree with <MotionDevTool>?"
    );
  }
  return context;
};
