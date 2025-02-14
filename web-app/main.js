import {CellValue, PlayerValue, Status} from "./Tictak.js";


const howToPlayButton = document.getElementById("how_to_play");
const howToPlayDialog = document.getElementById("how_to_play_dialog");
const closeDialogButton = document.getElementById("close_dialog_button");
const restartButton = document.querySelector("#reload");
const board = document.querySelector(".board");
const result_display = document.querySelector(".result_display");
const who_win = document.querySelector(".who_win");
const main_board=document.querySelector(".board");
const game_intro=document.querySelector("#about");
const restart_word =document.querySelector(".restart_word");
const about_url=
"https://northern-approach-b32.notion.site/Introduction-2f7460e24cb747e798244e68c1331cbd?pvs=4";

import TICTAK from "./Tictak.js";

let game_state= TICTAK.starter;


function play_win_sound() {
    // Create an audio element
    const win_audio = new Audio("assets/win.mp3");
    win_audio.play();
}

function play_click_sound() {
    const click_audio = new Audio("assets/techhy.wav");
    click_audio.play();
}



function update_board() {
[0, 1, 2].forEach((mainY) =>
    [0, 1, 2].forEach(function (mainX)  {
    const mainCell = document.querySelector(`[Y="${mainY}"][X="${mainX}"]`);
    mainCell.
    setAttribute("occupied", game_state.main_cell_status[mainY][mainX]);
    [0, 1, 2].forEach((subY) =>
        [0, 1, 2].forEach(function(subX)  {
        const cell = document
        .querySelector(
        `[mainy="${mainY}"][mainx="${mainX}"][suby="${subY}"][subx="${subX}"]`
        );
        cell.setAttribute("state", game_state.board[mainY][mainX][subY][subX]);
        cell.setAttribute("disabled", "");
        cell.removeAttribute("disappeared");
        if (
            (mainY === game_state.cell_cursor_y &&
                 mainX === game_state.cell_cursor_x) ||
            game_state.place_global
        ) {
            cell.removeAttribute("disabled");
        }
        if (game_state.main_cell_status[mainY][mainX] !== Status.PLAYING) {
            cell.setAttribute("disappeared", true);
        }
        })
    );
    })
);
}

function update_cursor() {
    // Clear cursor
    document
      .querySelectorAll('[active="true"]')
      .forEach(function(e){
         e.setAttribute("active", "false");});
    if (game_state.place_global) {
      board.setAttribute("active", "true");
      board
      .setAttribute("current_player", game_state.current_player.toString());
    } else {
      const cursorX = game_state.cell_cursor_x;
      const cursorY = game_state.cell_cursor_y;
      const cursorElement = document
      .querySelector(`[X="${cursorX}"][Y="${cursorY}"]`);
      cursorElement.setAttribute("active", "true");
      cursorElement
      .setAttribute("current_player", game_state.current_player.toString());
    }
}

function restart_game() {
    main_board.classList.add("transparent");
    setTimeout(function() {
        main_board.classList.remove("transparent");
    }, 500);
    game_state = TICTAK.starter;
    result_display.close();
    game_state.current_player = TICTAK.switch_player(game_state.current_player);
    update_board();
    update_cursor();
}


function handle_game_outcome() {
    let message;
    if (game_state.game_status!==Status.PLAYING) {
        switch (game_state.game_status) {
            case Status.RED_WIN:
                message = "Red player won!";
                break;
            case Status.BLUE_WIN:
                message = "Congratulations! Blue player won!";
                break;
            case Status.DRAW:
                message = "It's a draw!";
                break;
            default:
                message = "Game over!";
        }
        who_win.textContent = message;
        result_display.setAttribute("result", game_state.game_status);
        result_display.showModal();
        play_win_sound();
        setTimeout(function() {
            result_display.addEventListener("keydown", restart_game);
            result_display.addEventListener("click", restart_game);
        }, 1000);
    }
}


function create_board() {
    [0, 1, 2].forEach(function(main_y) {
        const div_main_y = document.createElement("div");
        div_main_y.classList.add("main_y");

        [0, 1, 2].forEach(function(main_x) {
            const div_main_x = document.createElement("div");
            div_main_x.setAttribute("Y", main_y.toString());
            div_main_x.setAttribute("X", main_x.toString());
            div_main_x.setAttribute("active", "false");
            div_main_x.setAttribute(
                "occupied",
                Status.PLAYING.toString()
            );
            div_main_x.setAttribute(
                "current_player",
                PlayerValue.BLUE.toString()
            );
            div_main_x.classList.add("main_x");
            div_main_x.classList.add("sub-cell");

            [0, 1, 2].forEach(function(sub_y) {
                const div_sub_y = document.createElement("div");
                div_sub_y.classList.add("sub_y");
                div_main_x.append(div_sub_y);

                [0, 1, 2].forEach(function(sub_x) {
                    const button_sub_x = document.createElement("button");
                    button_sub_x.classList.add("cell");
                    button_sub_x.setAttribute("mainy", main_y.toString());
                    button_sub_x.setAttribute("mainx", main_x.toString());
                    button_sub_x.setAttribute("suby", sub_y.toString());
                    button_sub_x.setAttribute("subx", sub_x.toString());
                    button_sub_x
                    .setAttribute("aria-label","mainy"+main_y+"mainx"+main_x+
                    "suby"+sub_y+"subx"+sub_x);
                    //on click behaviour definition
                    button_sub_x.addEventListener("click", function() {
                        game_state = TICTAK.try_move(
                            main_y,
                            main_x,
                            sub_y,
                            sub_x,
                            game_state
                        );
                        console.log(game_state);
                        console.log("click",main_y,main_x,sub_y,sub_x);
                        update_cursor();
                        update_board();
                        handle_game_outcome();
                        play_click_sound();
                    });
                    div_sub_y.append(button_sub_x);
                });
            });
            div_main_y.append(div_main_x);
        });
        board.append(div_main_y);
    });
}

restartButton.addEventListener("click", function(event) {
    play_click_sound();
    console.log("game restart");
    restart_game();
});

restartButton.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        play_click_sound();
        console.log("game restart");
        restart_game();
    }
});

game_intro.addEventListener("click", function(){
    play_click_sound();
    console.log("about  clicked");
    window.open(about_url, "_blank");
});

game_intro.addEventListener("keydown",function(event){
    if (event.key === "Enter") {
        play_click_sound();
        console.log("about  clicked");
        window.open(about_url, "_blank");
    }
});


howToPlayButton.addEventListener("click", function(){
    play_click_sound();
    howToPlayDialog.showModal();
});

howToPlayDialog.addEventListener("click", function(){
    play_click_sound();
    howToPlayDialog.close();
});

howToPlayDialog.addEventListener("keydown", function(event){
    if (event.key === "Enter") {
        play_click_sound();
        howToPlayDialog.close();
    }
});


create_board();
update_cursor();
restart_game();
play_click_sound();
