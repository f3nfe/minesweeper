// sorry for the name future Igor, also, if someone else is seeing this, shoot me a tweet at @bedesqui

// https://v10-beta--use-gesture.netlify.app/docs/gestures/#about-the-pinch-gesture
if (typeof document != "undefined") {
  //  Should probably wrap this in a useEffect so I can clean when re rendering
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("gesturechange", (e) => e.preventDefault());
}

export default function Home() {
  // set up variable to track game state
  const { gameState, reset } = useGameStateStore();
  // set up variables to track game difficulty
  const { difficulty } = useDifficultyStore();
  const { dimSize, bombNumber } = difficulty;
  // we need this to reset the game
  const { resetTimer } = useTimerStore();
  // we need this to modal state
  const { isOpen, close, open } = useModalStore();

  // game logic stuff
  const [board, setBoard] = useState<null | number[][]>(null);

  const startNewGame = () => {
    revealedCells.current = [];
    setBoard(createBoardWithJustNumbers(dimSize, bombNumber));
    let tempArray = new Array(dimSize * dimSize).fill(false);
    setIsThisCellRevealed(singleToMultiDimentionalArray(tempArray, dimSize));
    resetTimer();
    close();
    reset();
  };

  /**
   * This function will delete the board and clear some state to make the render the main menu instead of the game
   */
  const backToMenu = () => {
    revealedCells.current = [];
    setBoard(null);
    resetTimer();
    reset();
  };

  // make a bidimentional array the same size of board, give cells a calback so they can update themsemves here;
  const [isThisCellRevealed, setIsThisCellRevealed] = useState(null);
  useEffect(() => {
    let tempArray = new Array(dimSize * dimSize).fill(false);
    setIsThisCellRevealed(singleToMultiDimentionalArray(tempArray, dimSize));
  }, [dimSize, board]);

  // make a bidimentional array the same size of board, This will be used and reseted to set staggers to the cell animations;
  const [cellStaggerValues, setCellStaggerValues] = useState(null);
  useEffect(() => {
    let tempArray = new Array(dimSize * dimSize).fill(0);
    setCellStaggerValues(singleToMultiDimentionalArray(tempArray, dimSize));
  }, [dimSize, board]);

  useEffect(() => {
    if (!isThisCellRevealed) {
      return;
    }
  }, [isThisCellRevealed]);

  const revealedCells = useRef([]);

  //animation/gesture stuff
  const target = useRef(null);

  // show dialog when win/lose
  useEffect(() => {
    if (gameState == boardStateEnum.LOST || gameState == boardStateEnum.WON) {
      open();
    }
  }, [gameState]);

  return (
    <Box
      className={darkTheme}
      css={{
        position: "relative",
        height: "100vh",
      }}
    >
      <GameContainer ref={target} css={{ touchAction: "none" }}>
        {board && (
          <>
            <FloatingTimer />
            <FloatingToolSelector />
            <FloatingMenu backToMenu={backToMenu} startNewGame={startNewGame} />
          </>
        )}
        {!board ? (
          <MainMenu startNewGame={startNewGame} />
        ) : (
          <>
            <GestureContainer targetRef={target}>
              <GameHandler
                cellStaggerValues={cellStaggerValues}
                setCellStaggerValues={setCellStaggerValues}
                isThisCellRevealed={isThisCellRevealed}
                setIsThisCellRevealed={setIsThisCellRevealed}
                revealedCells={revealedCells}
                board={board}
                bombNumber={bombNumber}
                dimSize={dimSize}
              />
            </GestureContainer>
          </>
        )}
        <GameEndDialog
          open={isOpen}
          handleReset={startNewGame}
          playerWon={gameState == boardStateEnum.WON}
          handleClose={close}
        />
      </GameContainer>
    </Box>
  );
}

const Box = styled("div");

const GameContainer = styled("div", {
  position: "fixed",
  top: "0",
  right: 0,
  width: "100%",
  height: "100%",

  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  backgroundColor: "$background",

  color: "$text",
});

import { useEffect, useState, useRef } from "react";
import GameHandler from "../components/GameHandler";
import { createBoardWithJustNumbers } from "../lib/utils";

import { styled } from "../stitches.config";
import { darkTheme } from "../stitches.config";
import { singleToMultiDimentionalArray } from "../lib/utils";
import { GameEndDialog } from "../components/GameEndDialog";
import GestureContainer from "../components/GestureContainer";
import Bar from "../components/Bar";
import FloatingTimer from "components/FloatingTimer";
import FloatingToolSelector from "components/FloatingToolSelector";
import FloatingMenu from "components/FloatingMenu";

import {
  useDifficultyStore,
  useGameStateStore,
  useModalStore,
  useTimerStore,
} from "../lib/store";
import { boardStateEnum } from "../lib/boardStateEnum";
import MainMenu from "components/MainMenu";
