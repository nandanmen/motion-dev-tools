import { motion } from "./motion";
import { styled } from "./stitches";
import { MotionDevTool } from "./context";

function App() {
  return (
    <MotionDevTool>
      <Main>
        <Box animate={{ y: 0, x: 0 }} initial={{ y: 60, x: 60 }} />
      </Main>
    </MotionDevTool>
  );
}

const Main = styled("main", {
  width: "100vw",
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

// @ts-expect-error
const Box = styled(motion.div, {
  width: "10rem",
  height: "10rem",
  borderRadius: "8px",
  background: "$gray9",
});

export default App;
