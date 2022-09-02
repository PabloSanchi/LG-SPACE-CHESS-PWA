[![github-languages-image](https://img.shields.io/github/languages/top/PabloSanchi/LG-SPACE-CHESS-PWA.svg?color=red)]()
[![github-language-count-image](https://img.shields.io/github/languages/count/PabloSanchi/LG-SPACE-CHESS-PWA.svg)]()
[![Issues](https://img.shields.io/github/issues/PabloSanchi/LG-SPACE-CHESS-PWA.svg)](https://github.com/PabloSanchi/LG-SPACE-CHESS-PWA/issues)
[![github-repo-size-image](https://img.shields.io/github/repo-size/PabloSanchi/LG-SPACE-CHESS-PWA.svg?color=yellow)]()

# IMPORTANT NOTE
This is only a brief description of the LG Space Chess Controller.<br>
[Full Documentation and User Guide here!](./public/Documentation.pdf)

# LG SPACE CHESS PWA
Liquid Galaxy Space Chess PWA is the web/apk controller for the Space Chess Visualization project that runs in the rig/cluster.

## Structure
### Endpoints
- Dashboard [Endpoint - /]
- FindSat [Endpoint - /findsat]
- About [Endpoint - /about]

### Features

- Dashboard:
  - Chesboard:
    - Interative vote and piece movement
  - Votes:
    - Show current votes
    - Send status to the cluster
  - Player:
    - Go Backwards
    - Play/Pause
    - Go Fordwards
    - Speed x0.5
    - Speed x1
    - Speed x2
    - End demo (stop demo and reset screen)
  - Demo:
    - Selector of top 10 chess plays
  - Mode:
    - Opponent Selector (Satellite, Play Local)
    - Play against the satellite [NOW]
    - Play against the machine [NOW]
    - Play online [FUTURE]
  - Chess:
    - Show chess in the screens
  - Earth:
    - Show earth in the screens
  - ♖:
    - Show white pieces perspective in the screens
  - ◼:
    - Reset camera and chess position
  - ♜:
    - Show black pieces perspective in the screens
  - ↺: 
    - Negative rotation of the chessboard in the screens
  - ↑:
    - Increase slope of the chessboard in the screens
  - ↓:
    - Decrease slope of the chessboard in the screens
  - ↻:
    - Positive rotation of the chessboard in the screens


- LGSettings:
  - Enter IP (master ip of the cluster)
  - Reboot (Reboot cluster)
  - Relaunch (Relaunch cluster)
  - Poweroff (Poweroff cluster)
  - Connect
  - Disconnect

- FindSat:
  - Display the current position of the satellite in a map.

- About:
  - Project logos & author & mentors & tester & contact info & Logos & Description

- Header:
  - Connection semaphore (ON/OFF)
  - Toggle light/dark mode
  - Board button
  - FindSat button
  - LGSetting button
  - SignOut button
  - About button


# BUILD
```
yarn run build
```
# START
```
yarn run start
```

# DEV
```
yarn run dev
```

