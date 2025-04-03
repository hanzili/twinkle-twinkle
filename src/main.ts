import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { Scene1_Office } from './scenes/Scene1_Office';
import { Scene2_Skytrain } from './scenes/Scene2_Skytrain';
import { Scene3_Bus } from './scenes/Scene3_Bus';
import { Scene4_Ending } from './scenes/Scene4_Ending';

import { Game, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Scene1_Office,
        Scene2_Skytrain,
        Scene3_Bus,
        Scene4_Ending,
        MainGame,
        GameOver
    ]
};

export default new Game(config);
