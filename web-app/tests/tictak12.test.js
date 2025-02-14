import TICTAK, { CellValue, gen3x3, gen3x3x3x3, PlayerValue, Status } from '../Tictak.js';
import { describe } from "mocha";

console.log(TICTAK);
let expect_game_board = gen3x3x3x3(CellValue.NOTHING);
let expect_num_judge = gen3x3(0);
let expect_main_cell_status = gen3x3(Status.PLAYING);

function clear_expect() {
  expect_game_board = gen3x3x3x3(CellValue.NOTHING);
  expect_num_judge = gen3x3(0);
  expect_main_cell_status = gen3x3(Status.PLAYING);
}

describe("Apply a move", () => {
  it(`Given a game board that is not ended,
  When the current player makes a ply in a free cell, out of a cursor but can
  place globally Then the resulting board is:
  a valid board that is not ended with the next player to ply,
  or a valid board that is ended and not won by the next player.`,
  () => {
    clear_expect();
    let result = {};
    let expect_game_board = gen3x3x3x3(CellValue.NOTHING);
    expect_game_board[2][2][1][1] = CellValue.BLUE;
    let expect_place_count = [[0, 0, 0], [0, 0, 0], [0, 0, 1]];
    let current_state = TICTAK.starter;
    result = TICTAK.place_on_board(current_state,2, 2, 1, 1);
    let result_new_board= result[0]
    let result_new_place_count =result[1]
    let result_place_situation=result[2]
    if (JSON.stringify(result_new_board) !==
     JSON.stringify(expect_game_board)) {
      throw new Error("board is not as expected");
    };
    if (JSON.stringify(result_new_place_count) !==
    JSON.stringify(expect_place_count)) {
      throw new Error("board is not as expected");
    };
    if (result_place_situation !== true) {
      throw new Error("board is not as expected");
    };
  });

  it(`Given a board that is not ended, when player play on a cell that is not
  free, but in the right cursor then the result board, is the same as the
  original board then`,
  ()=>{
    clear_expect();
    let result = {};
    let expect_game_board = gen3x3x3x3(CellValue.NOTHING);
    expect_game_board[0][0][1][1] = CellValue.RED;
    let current_state = TICTAK.starter;
    current_state.board[0][0][1][1]=CellValue.BLUE;
    result = TICTAK.place_on_board(current_state,0, 0, 1, 1);
    let result_place_situation=result[2]
    if (result_place_situation !== false) {
      throw new Error("place situation is not as expected");
    };
  });

  it(`Given a board that is not ended, when player play on a cell that is free
  but not in the right cursor, then the result board,is the same as the
  original board then`,
    ()=>{
    let current_state = TICTAK.starter;
    current_state.cell_cursor_x=0
    current_state.cell_cursor_y=0
    current_state.place_global=false
    let result = TICTAK.place_on_board(current_state,2,2,1,1)
    let result_place_situation=result[2]
    if (result_place_situation !== false) {
        throw new Error("place situation is not as expected");
    };
    });

  it(`Given a board that is not ended, when player play on a cell that is free
  and in the right cursor, but cant place globally then the result board,is the
  same as the original board thenThen the resulting board is:a valid board that
  is not ended with the next player to ply,`,
    ()=>{
        let current_state = TICTAK.starter;
        current_state.cell_cursor_x=2
        current_state.cell_cursor_y=2
        current_state.place_global=false
        let result = TICTAK.place_on_board(current_state,2,2,1,1)
        let result_place_situation=result[2]
        if (result_place_situation !== true) {
            throw new Error("place situation is not as expected");
        };
    });
  it(`given a board is not ended, when player succesfully place a cell, but the
  main cell that the new cursor point to is full make next move can be place
  globally`,()=>
  {
    let current_state = TICTAK.starter;
    current_state.cell_cursor_x=1
    current_state.cell_cursor_y=1
    current_state.board[2][2]=[[CellValue.BLUE,CellValue.BLUE,CellValue.BLUE],
    [CellValue.BLUE,CellValue.BLUE,CellValue.BLUE],
    [CellValue.BLUE,CellValue.BLUE,CellValue.BLUE]]
    current_state.place_global=false
    let result = TICTAK.try_move(1,1,2,2,current_state)
    let temp =result
    if (result.place_global !== true) {
        throw new Error("Can't return the right place global");
    };
  })
});

describe("Game status", function () {
  it(`A board with a horizontal 3-in-a-row should be ended in a win for
  the player with that configuration.`, function () {
    const horizontal_win_main_cell = [
      [Status.BLUE_WIN, Status.BLUE_WIN, Status.BLUE_WIN],
      [Status.BLUE_WIN, Status.RED_WIN, Status.BLUE_WIN],
      [Status.BLUE_WIN, Status.BLUE_WIN, Status.RED_WIN]
    ];
    if (TICTAK.justify_win(horizontal_win_main_cell) !== Status.BLUE_WIN) {
      throw new Error("Can't justify horizontal winning");
    }
  });

  it(`Board with no one win should be draw`, function () {
    const draw_main_cell = [
      [Status.DRAW, Status.BLUE_WIN, Status.BLUE_WIN],
      [Status.BLUE_WIN, Status.RED_WIN, Status.BLUE_WIN],
      [Status.BLUE_WIN, Status.BLUE_WIN, Status.RED_WIN]
    ];
    if (TICTAK.justify_win(draw_main_cell) !== Status.DRAW) {
      throw new Error("Can't justify horizontal winning");
    }
  });

  it(`A board with a positive diagonal three-in-a-row should be ended in a win
  for the player with that configuration.`,
  function () {
    const positive_main_cell = [
      [Status.DRAW, Status.BLUE_WIN, Status.BLUE_WIN],
      [Status.BLUE_WIN, Status.BLUE_WIN, Status.BLUE_WIN],
      [Status.BLUE_WIN, Status.RED_WIN_WIN, Status.RED_WIN]
    ];
    if (TICTAK.justify_win(positive_main_cell) !== Status.BLUE_WIN) {
      throw new Error("Can't justify win");
    }
  });

  it(`A board with a negative diagonal three-in-a-row should be ended in a win
  for the player with that configuration.`, function () {
    const negative_main_cell = [
      [Status.BLUE_WIN, Status.BLUE_WIN, Status.RED_WIN],
      [Status.DRAW, Status.BLUE_WIN, Status.RED_WIN],
      [Status.DRAW, Status.RED_WIN_WIN, Status.BLUE_WIN]
    ];
    if (TICTAK.justify_win(negative_main_cell) !== Status.BLUE_WIN) {
      throw new Error("Can't justify win");
    }
  });
});