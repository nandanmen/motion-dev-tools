import React from "react";
import { motion as baseMotion } from "framer-motion";
import { v4 as uuid } from "uuid";

import { useMotionDevToolContext } from "./context";

export function Motion({ as = "div", ...props }) {
  const [id] = React.useState(uuid());
  const context = useMotionDevToolContext();

  React.useEffect(() => {
    if (context.state === "WAIT" && context.uuid === id) {
      context.send({
        type: "UPDATE_PROPS",
        props,
      });
    }
  }, [context]);

  const realProps = context.state === "ACTIVE" ? context.props : props;

  const Component = baseMotion[as];
  return <Component data-id={id} {...realProps} />;
}
