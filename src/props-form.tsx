import { useControls } from "leva";
import _ from "lodash";

type PropsFormProps = {
  props: Record<string, any>;
  onChange: (path: string, value: unknown) => void;
};

const VALID_PROPS = new Set(["animate", "initial"]);

export function PropsForm({ props, onChange }: PropsFormProps) {
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
        schema.step = 1;
      }

      return schema;
    })
  );

  return null;
}
