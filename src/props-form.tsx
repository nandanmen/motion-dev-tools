import { useControls, button } from "leva";
import _ from "lodash";

import { TransitionControls } from "./transition-controls";

type PropsFormProps = {
  props: Record<string, any>;
  onReplay: () => void;
  onChange: (path: string, value: unknown) => void;
};

const VALID_PROPS = new Set(["animate", "initial"]);

export function PropsForm({ props, onReplay, onChange }: PropsFormProps) {
  useControls({ Replay: button(onReplay) });

  const validProps = Object.entries(props).filter(([propName]) =>
    VALID_PROPS.has(propName)
  );

  return (
    <>
      {validProps.map(([propName, value]) => (
        <PropGroup
          key={propName}
          propName={propName}
          values={value}
          onChange={onChange}
        />
      ))}
      <TransitionControls values={props.transition ?? {}} onChange={onChange} />
    </>
  );
}

type PropGroupProps = {
  propName: string;
  values: object;
  onChange: (path: string, value: unknown) => void;
};

function PropGroup({ propName, values, onChange }: PropGroupProps) {
  useControls(
    propName,
    _.mapValues(values, (value, key) => {
      let schema = {
        value,
        onChange: (newValue: unknown) =>
          onChange(`${propName}.${key}`, newValue),
      } as any;

      if (["x", "y"].includes(key)) {
        schema.step = 2;
      }

      return schema;
    })
  );

  return null;
}
