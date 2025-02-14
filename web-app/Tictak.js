/**
 * Player values.
 * @enum {number}
 */
const PlayerValue = Object.freeze({
    BLUE: 1,
    RED: 2
});

/**
 * The possibles cell value
 * @enum {number}
 */
const CellValue = Object.freeze({
    NOTHING: 0,
    BLUE: 1,
    RED: 2
});

/**
 * Game status for the maincells and for the entire game.
 * @enum {number}
 */
const Status = Object.freeze({
    PLAYING: 0,
    BLUE_WIN: 1,
    RED_WIN: 2,
    DRAW: 3
});

/**
 * Winning combinations.
 * @type {Array<Array<number>>}
 */
const WinningCombos = Object.freeze([
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
]);


const compose = (f) => (g) => (x) => f(g(x));
const rep3 = (x) =>[structuredClone(x), structuredClone(x), structuredClone(x)];

/**
 * Generates a 3x3 array filled with the specified value.
 * @param {number} x - The value to fill the array with.
 * @returns {Array<Array<number>>} The generated 3x3 array.
 */
const gen3x3 = compose(rep3)(rep3);

/**
 * Generates a 3x3x3x3 array filled with the specified value.
 * @param {number} x - The value to fill the array with.
 * @returns {Array<Array<Array<Array<number>>>>} The generated 3x3x3x3 array.
 */

const gen3x3x3x3 = compose(gen3x3)(gen3x3);

const TICTAK = Object.create(null);

/**
 * Initializes the game state.
 * @returns {Object} The initial game state.
 */
TICTAK.starter = {
    "current_player": PlayerValue.BLUE,
    "cell_cursor_y": 1,
    "cell_cursor_x": 1,
    "place_global": true,
    "num_judge": gen3x3(0),
    "main_cell_status": gen3x3(CellValue.NOTHING),
    "board": gen3x3x3x3(CellValue.NOTHING),
    "game_status": Status.PLAYING
};
/**
 * Switches the current player.
 * @param {PlayerValue} current_player - The current player.
 * @returns {PlayerValue} The new player value.
 */
TICTAK.switch_player = function(current_player) {
    return (current_player === PlayerValue.BLUE ?
         PlayerValue.RED : PlayerValue.BLUE);
  };
/**
 * Places a move on the board. It will return the placing status if placing
 * success, and the newbaord with the move place and the new list that count
 * how many move that are placed on the main cell
 * @param {Object} state - The current game state.
 * @param {number} main_y - The Y-coordinate of the main cell player click
 * @param {number} main_x - The X-coordinate of the main cell player click
 * @param {number} sub_y - The Y-coordinate of the sub cell player click
 * @param {number} sub_x - The X-coordinate of the sub cell player click
 * @returns {Array} An array containing the updated board, num_judge,
 *  and a flag indicating if the move was placed.
 */
TICTAK.place_on_board= function(state, main_y, main_x, sub_y, sub_x)
{
    const new_board = structuredClone(state.board);
    const new_place_count = structuredClone(state.num_judge);

    // Can be place gloabally,Inteded location has nothing
    const condition1 =
        state.place_global &&
        state.board[main_y][main_x][sub_y][sub_x] === CellValue.NOTHING;

    //  Can't be place globally,
    // but Intended maincell location is same as placable location
    const condition2 =(
        !state.place_global &&
        main_y === state.cell_cursor_y &&
        main_x === state.cell_cursor_x );

    // Mattch either condtion 1 or 2
    //Current entire game is running, intended main cell is not full,
    //Nothing is in intended subcells
    const bar =
        (condition1 || condition2) &&
        state.game_status === 0 &&
        state.main_cell_status[main_y][main_x] === Status.PLAYING &&
        state.num_judge[main_y][main_x] < 9 &&
        state.board[main_y][main_x][sub_y][sub_x] === CellValue.NOTHING;

    if (bar) {
        new_place_count[main_y][main_x] += 1;
        new_board[main_y][main_x][sub_y][sub_x] = state.current_player;

        return [new_board, new_place_count, true];
    }
    return [new_board, new_place_count, false];
};
/**
 * Return a the state of a 3by3 board
 * @param {Array<Array<Status>>} board - The game board.
 * @returns {Status} The winning cell value or
 *  CellValue.NOTHING if there no winner.
 */
TICTAK.justify_win=function(board)
{
    for ( const combo of WinningCombos) {
        const [combo1, combo2, combo3] = combo;
        const sub_cells = [
        board[Math.floor(combo1 / 3)][combo1 % 3],
        board[Math.floor(combo2 / 3)][combo2 % 3],
        board[Math.floor(combo3 / 3)][combo3 % 3]
        ];
        const first_color = sub_cells[0];
        const all_same_color = sub_cells[0] === sub_cells[1] &&
        sub_cells[1] === sub_cells[2];

        if (all_same_color && first_color !== CellValue.NOTHING) {
        return first_color;
        };
    };
    let number_placed = 0;
    board.forEach(row => {
        row.forEach(cell => {
        if (cell === CellValue.BLUE || cell === CellValue.RED ||
            cell === Status.DRAW) {
            number_placed++;
        };
        });
    });
    if (number_placed === 9) {
        return Status.DRAW;
    }
    return Status.PLAYING;
};

/**
 * This will the retrun the main game status，and all the main cell
 * status
 * @param {*} board
 * @returns {object} a array consists of list of main cell status, and new
 * game status
 */
TICTAK.update_statueses=function(board)
{
    let new_game_status = Status.PLAYING
    let new_main_cell_status = board.map(row =>
        row.map(cell => this.justify_win(cell))
    );
    console.log(new_main_cell_status)

    new_game_status=this.justify_win(new_main_cell_status)
    return[new_main_cell_status,new_game_status]
};
/**
 * Attempts to make a move on the board. this will return the new
 * gamestate to the main js, if no move, it will return the original state
 * @param {number} main_y - The Y-coordinate of the main cell player click
 * @param {number} main_x - The X-coordinate of the main cell player click
 * @param {number} sub_y - The Y-coordinate of the sub cell player click
 * @param {number} sub_x - The X-coordinate of the sub cell player click
 * @param {Object} state - The current game state player click
 * @returns {Object} The updated game state after the move
 */

TICTAK.try_move=function(main_y, main_x, sub_y, sub_x, state)
{
    let [new_board, new_num_judge, place_status] =
    this.place_on_board(state, main_y, main_x, sub_y, sub_x);
    let [new_main_cell_status,new_game_status]=
    this.update_statueses(new_board)
    if (place_status === false) {
        console.log("no change made")
        return state
    }
    return {
        "current_player": this.switch_player(state.current_player),
        "cell_cursor_y": sub_y,
        "cell_cursor_x": sub_x,
        "place_global": new_num_judge[sub_y][sub_x] === 9 ||
        new_main_cell_status[sub_y][sub_x] !== Status.PLAYING,
        "num_judge": new_num_judge,
        "main_cell_status": new_main_cell_status,
        "board": new_board,
        "game_status": new_game_status
    };
};
export default Object.freeze(TICTAK);
export { PlayerValue, Status,gen3x3,gen3x3x3x3,CellValue }
