import { useControls } from "leva";
import _ from "lodash";

type TransitionControlsProps = {
  values: Record<string, any>;
  onChange: (path: string, value: unknown) => void;
};

export function TransitionControls({
  values,
  onChange,
}: TransitionControlsProps) {
  const { delay = 0, type = "spring" } = values;

  const typeSchema = getSchemaFromType(type, values);

  useControls(
    "transition",
    withOnChange(
      {
        type: {
          value: type,
          options: ["spring", "tween"],
        },
        delay: {
          value: delay,
          min: 0,
          step: 0.2,
        },
        ...typeSchema,
      },
      onChange
    )
  );

  return null;
}

function getSchemaFromType(type: string, values: Record<string, any>) {
  if (type === "spring") {
    const { damping = 10, mass = 1, stiffness = 100 } = values;
    return {
      damping: {
        value: damping,
        min: 0,
        step: 0.5,
      },
      mass: {
        value: mass,
        step: 0.5,
      },
      stiffness: {
        value: stiffness,
        step: 1,
      },
    };
  }
  return {};
}

function withOnChange(
  schema: Record<string, any>,
  handler: (path: string, value: unknown) => void
) {
  return _.mapValues(schema, (prop, key) => ({
    ...prop,
    onChange: (newValue: unknown) => handler(`transition.${key}`, newValue),
  }));
}
