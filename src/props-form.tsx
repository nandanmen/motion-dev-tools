import { styled } from "./stitches";

type PropsFormProps = {
  props: Record<string, any>;
  onChange: (newProps: Record<string, any>) => void;
};

const VALID_PROPS = new Set(["animate", "initial"]);

export function PropsForm({ props, onChange }: PropsFormProps) {
  const validProps = Object.entries(props).filter(([propName]) =>
    VALID_PROPS.has(propName)
  );
  return (
    <form>
      {validProps.map(([propName, values]) => {
        return (
          <fieldset key={propName}>
            <Label>{propName}</Label>
            {Object.entries(values).map(([key, value]) => {
              return (
                <Label>
                  {key}
                  <input
                    type="range"
                    min={0}
                    max={120}
                    value={value as number}
                    onChange={(evt) =>
                      onChange({
                        ...props,
                        [propName]: {
                          ...values,
                          [key]: evt.target.valueAsNumber,
                        },
                      })
                    }
                  />
                </Label>
              );
            })}
          </fieldset>
        );
      })}
    </form>
  );
}

const Label = styled("label", {
  display: "block",
});
