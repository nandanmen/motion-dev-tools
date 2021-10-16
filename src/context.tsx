import React from "react";

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
      type: "UPDATE_PROPS";
      props: Record<string, any>;
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
          case "UPDATE_PROPS": {
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
          case "UPDATE_PROPS": {
            setToolState({
              state: "ACTIVE",
              uuid: toolState.uuid,
              props: event.props,
            });
            return;
          }
          case "REPLAY": {
            setToolState({
              ...toolState,
              state: "WAIT_REPLAY",
            });
            return;
          }
          default:
            return;
        }
      }
      case "WAIT_REPLAY": {
        switch (event.type) {
          case "ANIMATION_DONE": {
            setToolState({
              ...toolState,
              state: "ACTIVE",
            });
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
      <ControlPanel>
        <h1>Controls</h1>
        <Debug>
          <pre>{JSON.stringify(toolState, null, 2)}</pre>
        </Debug>
        {isActiveState(toolState.state) && (
          <PropsForm
            props={toolState.props ?? {}}
            onChange={(props) => send({ type: "UPDATE_PROPS", props })}
          />
        )}
        <button onClick={() => send({ type: "REPLAY" })}>Replay</button>
      </ControlPanel>
    </Context.Provider>
  );
};

const Debug = styled("div", {
  background: "$gray6",
  padding: "8px",
  borderRadius: "4px",
  fontFamily: "SF Mono",
});

const ControlPanel = styled("div", {
  position: "fixed",
  top: "8px",
  left: "8px",
  padding: "8px",
  borderRadius: "8px",
  border: "2px solid $colors$gray8",
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
