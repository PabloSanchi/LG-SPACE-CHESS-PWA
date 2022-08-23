import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useDocument, useCollection } from 'react-firebase-hooks/firestore';
import { Chessboard } from "react-chessboard";
import { TailSpin } from "react-loader-spinner";
import { Chess } from "chess.js";
import toast, { Toaster } from 'react-hot-toast';

import {
    Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
    useMediaQuery, useDisclosure, Link, IconButton
} from '@chakra-ui/react';

import { Stack, Box, Progress, HStack, Button, Text, Flex, VStack, Icon, Badge, Center } from '@chakra-ui/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, doc } from "../firebase";
import { collection, updateDoc, setDoc, getDoc } from "firebase/firestore";
// import ReactNipple from 'react-nipple';
import { Joystick } from 'react-joystick-component';

import { MdOutlineCenterFocusWeak, MdPlayArrow, MdPause } from 'react-icons/md'
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, } from '@chakra-ui/react';
import { Switch, RadioGroup, Radio, useColorModeValue } from '@chakra-ui/react';

import requests from '../utils/requests';
import { Game, move, status, moves, aiMove, getFen } from 'js-chess-engine';

import { State } from './Header';
import { setGlobalState, useGlobalState } from '../components/socketState';

import { useRouter } from 'next/router'
import { io } from "socket.io-client";
import { TbMultiplier1X, TbMultiplier05X, TbMultiplier2X } from 'react-icons/tb';
import { CloseIcon } from '@chakra-ui/icons';


import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';

function DisplayChess() {
    
    // VARIABLE DECLARATIONS
    // demo info
    // const [playing] = useGlobalState('playing');
    // const setPlaying = (value) => { console.log('value: ' + value); setGlobalState('playing', value); }
    // const [showPlaying, setShowPlaying] = useState(false);
   
    // DEMO VARIABLES ------------------------------------------------------------
    const [showPlaying] = useGlobalState('showPlaying');
    const setShowPlaying = (value) => { setGlobalState('showPlaying', value); }

    const playing = useRef(false);
    const setPlaying = (value) => playing.current = value;
    

    
    const [demoStatus] = useGlobalState('demoStatus');
    const setDemoStatus = (value) => { setGlobalState('demoStatus', value); }

    const [index] = useGlobalState('index');
    const setIndex = (value) => { setGlobalState('index', value); }

    const [moves] = useGlobalState('moves');
    const setMoves = (value) => { setGlobalState('moves', value); }


    const currentStatus = useRef(new Chess());
    
    const [demoGame] = useGlobalState('demoGame');
    const setDemoGame = (value) => { setGlobalState('demoGame', value); }

    const pointer = useRef(0);
    const setPointer = (value) => { pointer.current = value; }
    const demo = useRef([]);
    const setDemo = (value) => { demo.current = value; }
    const animationSpeed = useRef(700);
    const setAnimationSpeed = (value) => { animationSpeed.current = value;}

    // DEMO VARIABLES ------------------------------------------------------------


    // const [playing, setPlaying] = useState(false);
    // theme color
    const bgColor = useColorModeValue('gray.50', 'whiteAlpha.50');
    const ColorMode = useColorModeValue('white', 'dark');

    // socket and status
    const [socket] = useGlobalState('socket');
    const setSocket = (soc) => {
        setGlobalState('socket', soc);
    }
    const [conStat, setConStat] = useState('Disconnected');
    const [enabledCon, setEnableCon] = useState(false);

    // game mode
    let parseLetter = { 1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 6: 'f', 7: 'g', 8: 'h' };
    // const [gamemode, setGamemode] = useState(1);
    const [gamemode] = useGlobalState('gamemode');
    const setGamemode = (mode) => { setGlobalState('gamemode', mode); }

    // const [squareStyle, setSquareStyle] = useState({});
    const [squareStyle] = useGlobalState('squareStyle');
    const setSquareStyle = (sty) => { setGlobalState('squareStyle', sty); }
    const [offlineGame] = useGlobalState('offlineGame');
    const setOfflineGame = (game) => { setGlobalState('offlineGame', game); }
    const [offlineStatus, setOfflineStatus] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');

    // user data
    const [user, loadingUser] = useAuthState(auth); // user
    const [arrow, setArrow] = useState(null); // chessboard arrow

    // media query
    const [isMobile] = useMediaQuery('(max-width: 560px)');
    const [dimensions, setDimensions] = useState({
        height: window.innerHeight,
        width: window.innerWidth
    }) // responsive (affect chessboard only)

    // vote modal
    const { isOpen, onOpen, onClose } = useDisclosure();

    // references
    const initialRef = useRef(null);
    const finalRef = useRef(null);
    // fetch chessboard status
    const [value, loading, error] = useDocument(
        doc(db, 'chess', 'ChessBoardStatus'),
        {
            snapshotListenOptions: { includeMetadataChanges: true },
        }
    );

    // fetch the user doc (uid, displayName, lgrigip, vote limit, ...)
    const [userDoc, loadingUserDoc, errorUserDoc] = useDocument(
        doc(db, 'users', user?.uid),
        {
            snapshotListenOptions: { includeMetadataChanges: true },
        }
    );

    // fetch the current votes
    const [valueVote, loadingVote, errorVote] = useDocument(
        doc(db, 'votes', 'dailyVote'),
        {
            snapshotListenOptions: { includeMetadataChanges: true },
        }
    );

    // notifications
    const notify = (text) => toast(text);

    // check if connected to the screens
    useEffect(() => {
        
        if (socket !== null) {
            setEnableCon(true); setConStat('Connected'); socket.emit('demoKill');
        } else {
            setEnableCon(false); setConStat('Disconnected');
        }

        setPlaying(false);
    }, [socket]);

    useEffect(() => {
        if(gamemode == 3) {
            
            pointer.current = index;
            demo.current = moves;

            currentStatus.current = demoGame;
            // currentStatus.current = new Chess(demoStatus);

            console.log('index: ', index);
            console.log('pointer: ', pointer.current);
            console.log('currentStatus: ', currentStatus.current);
        }
        // if(gamemode == 3) {
        //     setGamemode(1);
        // }
    }, [])


    /**
     * @description - useEffect to send the current chessboar status to the screens
     */
    useEffect(() => {
        if (!playing.current && socket && value?.data()?.status !== undefined) {
            console.log('gamemode: ' + gamemode);
            console.log((gamemode == 1 ? value.data()?.status : 
            (gamemode == 2 ? offlineGame.fen().split(' ')[0] : demoStatus)));

            socket.emit('currentBoard', {
                status: (gamemode == 1 ? value.data()?.status : 
                    (gamemode == 2 ? offlineGame.fen().split(' ')[0] : demoStatus))
            });
        }
    }, [socket, value?.data()?.status])

    // fetch arrows (last user vote)
    useEffect(() => {

        const getArrows = async () => {
            var val = null;
            try {

                while (loadingUser) { } // waiting for auth hook
                var el = await getDoc(doc(collection(db, "users"), user.uid));
                val = (el.data()?.vote ? el.data()?.vote : null);

                setArrow(val)

            } catch (err) { }

        }
        getArrows();
    }, [loadingUser, user.uid]);

    /*
    handle black pieces move when value().data.status changes
    */
    // useEffect(() => {
    //     if (socket && gamemode == 1) {
    //         socket.emit('newStatus', {
    //             status: value?.data()?.status,
    //             move: ''
    //         });
    //     }
    // }, [value?.data()?.status]);


    // DEMO MODE -----------------------------------------------------------------


    function startDemo(data) {
        setDemo(data.moves); // demo = data.moves;
        setMoves(data.moves);
        setPointer(0);
        setIndex(pointer.current);

        if(socket) {
            socket.emit('startDemo');
        }
        // start demo
        demoMode();
    }

    function forward() {
        console.log('forward');
        if(demo.current.length == 0) return;
        if(playing.current) { setPlaying(false); setShowPlaying(false); return; }
        if(pointer.current <= demo.current.length-1) {
            

            currentStatus.current.move({
                from: demo.current[pointer.current].substring(0,2).toLowerCase(), 
                to: demo.current[pointer.current].substring(2,4).toLowerCase(),
                promotion: 'q',
            });

            setDemoStatus(currentStatus.current.fen());
            setDemoGame(currentStatus.current);

            if(socket) {
                socket.emit('demoMove', {
                    move: demo.current[pointer.current],
                    speed: animationSpeed.current
                });
            }
            setPointer(pointer.current + 1); 
            setIndex(pointer.current);
        }
    }

    function backward() {
        console.log('backward');
        if(demo.current.length == 0) return;
        if(playing.current) {setPlaying(false); setShowPlaying(false); return; }
        if(pointer.current == 0) return;

        setPointer(pointer.current - 1);
        setIndex(pointer.current);
        // create backward socket emition
        
        currentStatus.current.undo();
        setDemoStatus(currentStatus.current.fen());
        setDemoGame(currentStatus.current);

        if(socket) {
            socket.emit('demoBack', {
                content: demo.current,
                pointer: pointer.current,
                speed: animationSpeed.current
            });
        }

    }

    function playPause() {
        console.log('length: ' + demo.current.length);
        console.log('playing: ' + playing.current);
        if(demo.current.length == 0) return;

        setShowPlaying(!playing.current);
        setPlaying(!playing.current);
        if(playing.current) demoMode();

    }

    function demoMode() {
        
        // send move with certain speed
        console.log('pointer: ' + pointer.current);

        let move = currentStatus.current.move({
            from: demo.current[pointer.current].substring(0,2).toLowerCase(), 
            to: demo.current[pointer.current].substring(2,4).toLowerCase(),
            promotion: 'q',
        });

        setDemoStatus(currentStatus.current.fen());
        setDemoGame(currentStatus.current);

        if(socket) {
            socket.emit('demoMove', {
                move: demo.current[pointer.current],
                speed: animationSpeed.current
            });
        }

        setPointer(pointer.current + 1); setIndex(pointer.current); // pointer++;

        setTimeout(() => {
            if(pointer.current < demo.current.length-1 && playing.current) requestAnimationFrame(demoMode);
            else if(pointer.current == demo.current.length-1) killDemo();
        }, animationSpeed.current);
    }
    // END DEMO MODE -------------------------------------------------------------


    /*
    sendInstruction -> send instruction to lgrig via WebSockets
    instruction: 
        - showDemo (demo of game chess)
        - showChess (show chessboard)
        - showEarth (show earth illustration)
    */
    const sendInstruction = (instruction) => {
        if (socket) {
            if (instruction == 'showDemo') sendInstruction('showChess');
            console.log('emmiting: ' + instruction);
            socket.emit(instruction);
        }
    }

    /*
    sendMove -> set new camera offset to lgrig via WebSockets
        - only depth and axis control
    */
    const sendMove = (xVal, zVal) => {
        if (socket) {
            socket.emit('controllerMove', {
                x: xVal,
                z: zVal,
            });
        }
    }

    /*
    updateView -> set view perspective (center, white, black)
    */
    const updateView = (value, xOff = 0) => {
        if (socket) {
            socket.emit('updateView', {
                where: value,
                whereX: xOff
            });
        }
    }

    /**
     * 
     * @param {String} cad
     * @param {Char} target
     * @returns {String}
     */
    const getkingSquare = (cad, target) => {
        let a = 1, b = 0;

        for (let i = 0; i < cad.length; ++i) {
            if (parseInt(cad[i])) {
                b += parseInt(cad[i]);
            } else if (cad[i] == '/') {
                a++; b = 0;
            } else b++;

            if (cad[i] == target) break;
        }

        return [parseLetter[b], 9 - a].join('')
    }

    const resetOfflineGame = () => {
        setOfflineGame(new Chess());
        setOfflineStatus(new Chess().fen().split(' ')[0]);
        setSquareStyle({});
        if (socket)
            socket.emit('currentBoard', { status: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' });
    }

    const restoreScreenBoard = () => {
        setPlaying(false);
        if (socket) socket.emit('currentBoard', { status: (gamemode == 1 ? value.data()?.status : (gamemode == 2 ? offlineGame.fen().split(' ')[0] : demoStatus)) });
    }

    /**
    * onDropOffline -> set onDrop and AI move
        - move validation
        - AI move
    * @param {String} sourceSquare 
    * @param {String} targetSquare 
    * @returns {boolean} true if the move is legal, false if ilegal
    */
    async function onDropOffline(sourceSquare, targetSquare) {

        // apply move
        let move = offlineGame.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
        });

        // check if move is legal
        if (move === null) {
            notify('❌ Illegal Move: ' + targetSquare);
            return false;
        }

        // higlight move (source and target square)
        setSquareStyle({
            [sourceSquare]: { backgroundColor: '#ffc107' },
            [targetSquare]: { backgroundColor: '#ffc107' },
        });

        // send status to the screens if connected
        if (socket) {
            socket.emit('newStatus', {
                status: '',
                move: (sourceSquare + ' ' + targetSquare)
            });

            console.log('Player MOVE: ' + sourceSquare + ' - ' + targetSquare);
        }

        // update state
        setOfflineStatus(offlineGame.fen().split(' ')[0]);

        // if the game has ended via checkmate, stalemate, draw, threefold repetition, or insufficient material. 
        // Otherwise, returns false.
        if (offlineGame.game_over()) {
            notify('🏆 WHITE WINS');
            setTimeout(() => resetOfflineGame(), 1000);
            return false;
        } else {
            // if the AI is in check
            if (offlineGame.in_check()) {
                let sq1 = getkingSquare(offlineGame.fen().split(' ')[0], 'k');
                console.log('K: ' + sq1);
                setSquareStyle(current => ({ ...current, [sq1]: { backgroundColor: '#ff4444' } }));
            }

            setTimeout(() => blackMove(), 1000);
        }

        return true;
    }

    /**
     * 
     * @returns {boolean} true if the user lost
     */
    async function blackMove() {
        // if AI loses the game
        if (offlineGame.game_over()) {
            if (socket) socket.emit('currentBoard', { status: (gamemode == 1 ? value.data()?.status : offlineGame.fen().split(' ')[0]) });
            setOfflineGame(new Chess());
            setOfflineStatus(new Chess().fen().split(' ')[0]);
            return true;
        }

        // make AI move
        let response = new Game(offlineGame.fen());
        let move = response.aiMove(3);
        let key = Object.keys(move)[0];
        let vote = `${key.toLowerCase()}_${move[key].toLowerCase()}`;


        const bestMoveSan = offlineGame.move({
            from: vote.split('_')[0],
            to: vote.split('_')[1],
            promotion: "q",
        });

        // higlight move (source and target square)
        setSquareStyle({
            [vote.split('_')[0]]: { backgroundColor: '#ffc107' },
            [vote.split('_')[1]]: { backgroundColor: '#ffc107' },
        });


        if (socket) {
            socket.emit('newStatus', {
                status: '',
                move: (vote.split('_')[0] + ' ' + vote.split('_')[1])
            });

            console.log('AI MOVE: ' + vote.split('_')[0] + ' - ' + vote.split('_')[1]);
        }

        setOfflineStatus(offlineGame.fen().split(' ')[0]);

        // if the game has ended via checkmate, stalemate, draw, threefold repetition, or insufficient material. 
        // Otherwise, returns false.
        if (offlineGame.game_over()) {
            notify('🏆 BLACK WINS');
            setTimeout(() => resetOfflineGame(), 1000);
            return false;
        } else {
            if (offlineGame.in_check()) {
                let sq1 = getkingSquare(offlineGame.fen().split(' ')[0], 'K');
                console.log('K: ' + sq1);
                setSquareStyle(current => ({ ...current, [sq1]: { backgroundColor: '#ff4444' } }));
            }

            return true;
        }
    }

    /**
    * onDrop modification
        we give some extra functions:
            - add move validation
            - save move in the database
    * @param {String} sourceSquare 
    * @param {String} targetSquare 
    * @returns  {Boolean}  true if the move is legal, false if ilegal
    */
    async function onDrop(sourceSquare, targetSquare) {

        // offline play
        if (gamemode == 2) {
            return onDropOffline(sourceSquare, targetSquare);
        }else if(gamemode == 3) return;

        if (value.data()?.turn == 'b') {
            notify('⚠️ Wait for your turn');
            return false;
        }

        if (userDoc.data()?.limit <= 0) {
            notify('❌ Limit Reached: 3/3');
            setArrow([arrow[0], arrow[1]]);
            return false;
        }

        if (Array.isArray(arrow) && sourceSquare == arrow[0] && targetSquare == arrow[1]) {
            setArrow([sourceSquare, targetSquare]); // re-render the move
            return true; // exit the function
        }

        const game = new Chess() // create empty game
        let move = null;
        game.load(value.data().status + ' w - - 0 1'); // load current game status

        // make the move
        // return null if move is not allowed
        move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
        });

        // illegal move
        if (move === null) {
            notify('❌ Illegal Move: ' + targetSquare);
            setArrow(arrow);
            return false;
        }

        // send fen status to the rig (if connected):
        if (socket) {
            socket.emit('newStatus', {
                status: value.data().status, // game.fen().split(' ')[0], 
                move: (sourceSquare + ' ' + targetSquare)
            });
        }

        // legal move
        notify('✅ Success: ' + targetSquare);

        // update vote in the real time database
        // - quit the current vote if so   
        // - add the new vote or update it
        const docSnap = await getDoc(doc(db, "votes/dailyVote"));
        if (docSnap.exists()) {

            const value = docSnap.data();
            // if the user already has a vote
            // - decrement by one the move voted
            if (Array.isArray(arrow)) {
                setDoc(doc(db, `votes/dailyVote`), {
                    [`${arrow[0]}_${arrow[1]}`]: (value[`${arrow[0]}_${arrow[1]}`] - 1),
                }, { merge: true });
            }
            // add new vote or update it
            if (value[`${sourceSquare}_${targetSquare}`]) {
                setDoc(doc(db, `votes/dailyVote`), {
                    [`${sourceSquare}_${targetSquare}`]: (value[`${sourceSquare}_${targetSquare}`] + 1),
                }, { merge: true });
            } else {
                setDoc(doc(db, `votes/dailyVote`), {
                    [`${sourceSquare}_${targetSquare}`]: 1,
                }, { merge: true });
            }
        }

        // update vote in the user ref
        updateDoc(doc(collection(db, "users"), user.uid), {
            vote: [sourceSquare, targetSquare],
            limit: userDoc.data().limit - 1,
        }).catch(() => {
            notify('❌ Error');
        });

        setArrow([sourceSquare, targetSquare]);

        return true;
    }

    /*
    responsive (useLayout is not asynchronous, is synchronous) 
    we use it so we wont have any misplaced components. 
    */
    useLayoutEffect(() => {
        function handleResize() {

            setTimeout(() => {
                // if (window.innerWidth > 340) { //375
                if (dimensions.width != window.innerWidth && dimensions.height != window.innerHeight) {
                    setDimensions({
                        height: window.innerHeight,
                        width: window.innerWidth
                    })
                }
            }, 100);
        }

        window.addEventListener('resize', handleResize)
        return _ => {
            window.removeEventListener('resize', handleResize)
        }
    });

    /**
     * setSpeed -> send the speed to the rig
     * @param {Number} val 
     */
    const setSpeed = (val) => {
        if (socket) {
            socket.emit('demoSpeed', {
                speed: val
            });
        }
    }

    /**
     * killDemo -> kill the demo & set the chessboard accordingly to the gamemode
     */
    const killDemo = () => {

        setPlaying(false); setShowPlaying(false);
        console.log('demo killed');
        setDemo([]); setMoves([]);

        if (socket) {
            socket.emit('demoKill');
            setTimeout(() => {
                if (socket && value?.data()?.status !== undefined) {
                    socket.emit('currentBoard', {
                        status: value.data()?.status,
                        // status: (gamemode == 1 ? value.data()?.status : offlineGame.fen().split(' ')[0])
                    });
                }
                notify('demo ended');
                // setGamemode(1);
                // restoreScreenBoard();
            }, 1250);

        }
        
        setGamemode(1);
    }

    /**
     * 
     * @param {Object} props { disp, show, color }
     * @returns Component (Demo selector)
     */
    function DrawerDemo({ disp, show, color }) {
        const { isOpen, onOpen, onClose } = useDisclosure()
        const btnRef = React.useRef()

        return (
            <>
                <Button display={disp} disabled={show} ref={btnRef} mt={10} m={1} size='md' colorScheme={color} onClick={onOpen} >Top Plays</Button>
                <Drawer
                    isOpen={isOpen}
                    placement='right'
                    onClose={onClose}
                    finalFocusRef={btnRef}
                >
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>Top 10 Plays</DrawerHeader>

                        <DrawerBody>
                            {Object.keys(requests).map((num) => {
                                return <Text key={num} padding={5} backgroundColor={bgColor} mb={1} borderRadius={10} fontWeight='semibold'
                                    _hover={{
                                        transform: 'scale(0.95)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease-in-out'
                                    }}
                                    onClick={() => {
                                        notify('▶️ ' + num);
                                        setPlaying(true); setShowPlaying(true);
                                        currentStatus.current = new Chess();
                                        setDemoGame(currentStatus.current);
                                        setDemoStatus(new Chess()); startDemo(requests[num]);
                                        setGamemode(3);
                                        onClose();
                                    }}
                                >
                                    {`${num}`}
                                </Text>
                            })}
                        </DrawerBody>

                        <DrawerFooter>
                            <Button variant='outline' colorScheme='orange' mr={3} onClick={onClose}>
                                Close
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </>
        )
    }

    /**
     * 
     * @param {Object} props { disp, show, color }
     * @returns Component (Gamemode selector)
     */
    function PlacementSetting({ disp, show, color }) {
        const { isOpen, onOpen, onClose } = useDisclosure()

        return (
            <>
                <Button display={disp} disabled={show} mt={10} m={1} w={20} size='md' colorScheme={color} onClick={onOpen} >Mode</Button>
                <Drawer placement={'right'} onClose={onClose} isOpen={isOpen}>
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerHeader borderBottomWidth='1px'>Game Mode</DrawerHeader>
                        <DrawerBody>
                            <Text fontSize='sm' fontWeight='semibold' mb={2}>Choose Oponent</Text>
                            <RadioGroup onChange={(val) => {
                                // if(demo.current.length > 0) killDemo();
                                setGamemode(parseInt(val));
                                if (socket)
                                    socket.emit('currentBoard', {
                                        status: (val == 1 ? value.data().status :
                                        (val == 2 ? offlineGame.fen().split(' ')[0] : demoStatus))
                                    });
                            }}
                                value={gamemode.toString()}
                            >
                                <Stack direction='column' gap={4}>
                                    <Radio value='1'>Satellite</Radio>
                                    <Radio value='2'>Play Local</Radio>
                                    {demo.current.length > 0 && <Radio value='3'>Top plays</Radio>}
                                </Stack>
                            </RadioGroup>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </>
        )
    }

    return (
        <VStack h="calc(100vh-3.5rem)" w="100vw" position="absolute">
            {/* Notifications */}
            <Toaster />
            {/* Main */}
            <Flex direction={{ base: 'column-reverse', md: 'column-reverse', lg: 'row' }}>

                {error && <strong>Error: {JSON.stringify(error)}</strong>}
                {loading && <TailSpin type="Puff" color="#808080" height="100%" width="100%" />}

                <VStack mt={{ base: 2, md: 5, lg: 12 }} mr={{ base: 0, md: 5, lg: 5 }} >
                    <VStack mb={5} display={{ base: (enabledCon ? 'flex' : 'none'), md: 'flex', lg: 'flex' }} align='center' justify='center'>

                        {/* Chessboard position controls */}
                        <HStack >
                            <Button
                                fontSize={30}
                                display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }}
                                disabled={!enabledCon} w={12} h={20} size='sm'
                                colorScheme='gray' onClick={() => updateView('white')}
                            >
                                {ColorMode == 'white' ? '♖' : '♜'}
                            </Button>

                            <IconButton display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} w={20} h={20} size='md' colorScheme='gray' onClick={() => updateView('center')} icon={<MdOutlineCenterFocusWeak size="sm" />} />
                            <Button
                                w={12}
                                fontSize={30}
                                display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }}
                                disabled={!enabledCon} h={20} size='sm' colorScheme='gray' onClick={() => updateView('black')}>
                                {ColorMode == 'white' ? '♜' : '♖'}
                            </Button>
                        </HStack>

                        {/* Chessboard vertical position controls */}
                        <HStack >
                            <Button fontSize={30} display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={0.5} h={20} size='md' colorScheme='gray' onClick={() => updateView(+0.1)}>↺</Button>
                            <Flex direction='column' >
                                <Button fontSize={30} display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} size='lg' colorScheme='gray' onClick={() => updateView(0, -0.1)}>↑</Button>
                                <Button fontSize={30} display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} size='lg' colorScheme='gray' onClick={() => updateView(0, +0.1)}>↓</Button>
                            </Flex >
                            <Button fontSize={30} display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} h={20} size='md' colorScheme='gray' onClick={() => updateView(-0.1)}>↻</Button>
                        </HStack >

                    </VStack>

                    {/* JoySticks */}
                    {conStat == 'Connected' &&
                        <Flex display={{ base: 'none', md: 'none', lg: 'block' }} m={5} justify='space-between'>
                            <Joystick
                                size={100}
                                sticky={false}
                                baseColor="#3e964e"
                                stickColor="#0e611d"
                                move={(e) => {
                                    try {
                                        if (e.direction == 'LEFT')
                                            sendMove(-3, 0)
                                        else if (e.direction == 'RIGHT')
                                            sendMove(+3, 0)
                                    } catch (err) { }
                                }}
                            ></Joystick>
                        </Flex>
                    }

                    {conStat == 'Connected' &&
                        <VStack display={{ lg: 'none' }}>
                            <HStack justifyContent={'center'}>
                                <Button w={50} h={50} onClick={() => sendMove(0, -50)}>&uarr;</Button>
                                <Button mr={5} w={50} h={50} onClick={() => sendMove(50, 0)}>&larr;</Button>
                                <Button ml={5} w={50} h={50} onClick={() => sendMove(-50, 0)}>&rarr;</Button>
                                <Button w={50} h={50} onClick={() => sendMove(0, 50)}>&darr;</Button>

                            </HStack>
                            <Text m={2} p={5} noOfLines={2}></Text>
                        </VStack>
                    }

                </VStack >

                <Flex direction={{ base: 'column', md: 'column', lg: 'row' }}>
                    {/* DATA & BOARD*/}
                    <Box align="center" mb={3}>
                        <HStack>
                            {userDoc && <Badge m={1} colorScheme='none' > IP: {userDoc.data()?.lqrigip}</Badge>}
                            {value &&
                                <Badge m={1} colorScheme='none'>Turn:
                                    {gamemode == 1
                                        ?
                                        (value.data()?.turn == 'w' ? ' You' : ' Satellite')
                                        :
                                        (gamemode == 2 ? (offlineGame.turn() == 'w' ? ' You' : ' Opponent') : 'TOP PLAY')
                                    }
                                </Badge>
                            }
                            {userDoc && gamemode == 1 && <Badge mt={3} colorScheme='none' >Attempts: {userDoc.data()?.limit}</Badge>}
                        </HStack>

                        {userDoc && value &&
                            <Chessboard
                                boardWidth={isMobile ? (dimensions.width - 20 > 420 ? 375 : dimensions.width - 20) : 420}
                                position={
                                    gamemode == 1 ? 
                                    value.data()?.status :
                                    (gamemode == 2 ? 
                                        offlineGame.fen().split(' ')[0] : 
                                        demoStatus
                                    )
                                }
                                onPieceDrop={onDrop}
                                customDropSquareStyle={{ boxShadow: 'inset 0 0 1px 6px rgba(255,200,100,0.75)' }}
                                animationDuration={300}
                                customArrows={arrow === null || gamemode != 1 ? [] : [arrow]}
                                customBoardStyle={{ borderRadius: '5px' }}
                                customSquareStyles={gamemode == 2 ?
                                    squareStyle : {}
                                }
                            />
                        }

                        {/* PLAYER */}
                        <Flex display={gamemode == 3 ? 'flex' : 'none'} mt={3} align="center" justify='center' direction={['column', 'row', 'row']} gap={2}>
                            <HStack>
                                <IconButton size="md" w={12} onClick={backward} icon={<ArrowLeftIcon w={8} h={8} />} />
                                <Button fontSize={30} w={12} size="md" onClick={() => {
                                    playPause();
                                }}
                                    colorScheme={!showPlaying ? 'red' : 'green'}
                                >
                                    <Icon w={12} h={12} as={showPlaying ? MdPause : MdPlayArrow} />
                                </Button>
                                <IconButton size="md" w={12} onClick={forward} icon={<ArrowRightIcon w={8} h={8} />} />

                                <Button size="md" w={12} fontSize={30} onClick={() => setAnimationSpeed(1250)} >
                                    <Icon w={12} h={12} as={TbMultiplier05X} />
                                </Button>
                                <Button size="md" w={12} fontSize={30} onClick={() => setAnimationSpeed(700)} >
                                    <Icon w={12} h={12} as={TbMultiplier1X} />
                                </Button>
                                <Button size="md" w={12} fontSize={30} onClick={() => setAnimationSpeed(400)} >
                                    <Icon w={12} h={12} as={TbMultiplier2X} />
                                </Button>
                            </HStack>

                            <HStack>
                                <Button size='md' colorScheme='red' onClick={killDemo} >End Play</Button>
                            </HStack>
                        </Flex>
                    </Box>

                    {/* VOTES AND DEMO PLAYER */}
                    <Flex mt={{ base: 2, md: 2, lg: 12 }} direction='column' align='center' ml={2} >

                        <HStack m={1}>
                            <Button display={socket ? 'block' : 'none'} m={1} size='md' colorScheme='red' onClick={restoreScreenBoard}>RESTORE</Button>
                            <Button m={1} size='md' colorScheme='orange' onClick={() => { if (socket && valueVote?.data()) { socket.emit('showVotes', valueVote?.data()); } onOpen(); }}>Votes</Button>
                            <DrawerDemo disp='block' color='orange' />
                        </HStack>
                        {/* LGRig Controller */}
                        {/* gamemode and demo */}
                        <HStack m={1}>
                            <PlacementSetting disp='block' color='orange' />
                            <Button size='md' colorScheme='red' disabled={gamemode != 2} onClick={resetOfflineGame} >Reset</Button>
                        </HStack>

                        {/* View options */}
                        <HStack display={enabledCon ? 'flex' : 'none'} m={1}>
                            <Button display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} w={20} size='md' colorScheme='orange' onClick={() => sendInstruction('showChess')}>Chess</Button>
                            <Button display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} w={20} size='md' colorScheme='orange' onClick={() => sendInstruction('showEarth')}>Earth</Button>
                        </HStack>

                        {/* right joystick only for large view */}
                        {conStat == 'Connected' &&
                            <Center mt={20} align="center" justify="space-between" display={{ base: 'none', md: 'none', lg: 'block' }} >
                                <Joystick
                                    size={100}
                                    sticky={false}
                                    baseColor="#349beb"
                                    stickColor="#0f64a6"
                                    move={(e) => {
                                        try {
                                            if (e.direction == 'FORWARD')
                                                sendMove(0, -3)
                                            else if (e.direction == 'BACKWARD')
                                                sendMove(0, +3)
                                        } catch (err) { }
                                    }}
                                ></Joystick>
                            </Center>
                        }
                    </Flex>
                </Flex>

            </Flex>

            {/* Show votes */}
            <GetModal
                votes={valueVote?.data()}
                open={isOpen}
                close={() => { if (socket) { socket.emit('showVotes'); } onClose() }}
                iniFR={initialRef}
                finFR={finalRef}
                soc={socket}
            />
        </VStack>
    )
}

// votes modal
function GetModal({ votes, open, close, iniFR, finFR, soc }) {
    let keys = 0;
    return (
        <Modal
            initialFocusRef={iniFR}
            finalFocusRef={finFR}
            isOpen={open}
            onClose={close}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Current Votes</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>

                    {votes && Object.keys(votes).map((key, index) => {
                        return (
                            <Box key={index}>
                                {(key != 'status' && votes[key] > 0) ?
                                    <Box>
                                        {key.split('_')[0].toUpperCase()} -
                                        {key.split('_')[1].toUpperCase()}
                                        <Progress hasStripe isAnimated value={votes[key]} />
                                    </Box>
                                    : ''
                                }
                            </Box>
                        )
                    }
                    )}

                </ModalBody>
                <ModalFooter>
                    <VStack>
                        <HStack>
                            <Button color="white" backgroundColor="#CD853F" mr={3} onClick={close}>
                                Ok
                            </Button>
                        </HStack>
                    </VStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default DisplayChess