import React from "react";
import { motion as baseMotion } from "framer-motion";
import { v4 as uuid } from "uuid";

import { styled } from "./stitches";
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
            type: "SET_PROPS",
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
  const { initial } = realProps;

  const Component = baseMotion[as];
  return (
    <Wrapper>
      {initial && context.state === "ACTIVE" && (
        <InitialBox
          className={props.className}
          style={{ x: initial.x, y: initial.y }}
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
        />
      )}
      <Component data-name="Box" data-id={id} key={key} {...realProps} />
    </Wrapper>
  );
}

const Wrapper = styled("div", {
  position: "relative",
});

const InitialBox = styled(baseMotion.div, {
  border: "2px dashed $colors$gray9",
  background: "transparent !important",
  position: "absolute",
});
