import React from "react";
import { motion as baseMotion } from "framer-motion";
import { v4 as uuid } from "uuid";

import { useMotionDevToolContext } from "./context";

export function Motion({ as = "div", ...props }) {
  const [id] = React.useState(uuid());
  const [key, setKey] = React.useState(uuid());
  const context = useMotionDevToolContext();

  React.useEffect(() => {
    if ("uuid" in context && context.uuid === id) {
      switch (context.state) {
        case "WAIT": {
          context.send({
            type: "UPDATE_PROPS",
            props,
          });
          break;
        }
        case "WAIT_REPLAY": {
          setKey(uuid());
          context.send({
            type: "ANIMATION_DONE",
          });
          break;
        }
      }
    }
  }, [context]);

  const realProps = context.state === "ACTIVE" ? context.props : props;

  const Component = baseMotion[as];
  return <Component data-id={id} key={key} {...realProps} />;
}
