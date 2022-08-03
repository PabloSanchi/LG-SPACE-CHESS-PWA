import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useDocument, useCollection } from 'react-firebase-hooks/firestore';
import { Chessboard } from "react-chessboard";
import { TailSpin } from "react-loader-spinner";
import { Chess } from "chess.js";
import toast, { Toaster } from 'react-hot-toast';
import Header from './Header';

import {
    Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
    useMediaQuery, useDisclosure, Link
} from '@chakra-ui/react';

import { IconButton, Box, Progress, HStack, Button, Text, Flex, VStack, Icon, Badge, Center } from '@chakra-ui/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, doc } from "../firebase";
import { collection, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { io } from "socket.io-client";
import { useRouter } from 'next/router'
import ReactNipple from 'react-nipple';

import { MdOutlineCenterFocusWeak } from 'react-icons/md'
import { CloseIcon } from '@chakra-ui/icons';

import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
} from '@chakra-ui/react'

function DisplayChess() {

    // variable definition
    let soc = 'null';
    const router = useRouter();
    const [socket, setSocket] = useState(null);
    const [conStat, setConStat] = useState('Disconnected');
    const [enabledCon, setEnableCon] = useState(false);
    const [user, loadingUser] = useAuthState(auth); // user
    const [arrow, setArrow] = useState(null); // chessboard arrow
    const [isMobile] = useMediaQuery('(max-width: 560px)');
    const [dimensions, setDimensions] = useState({
        height: window.innerHeight,
        width: window.innerWidth
    }) // responsive (affect chessboard only)

    const [urlSoc, setUrlSoc] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();

    const initialRef = useRef(null);
    const finalRef = useRef(null);

    const plays = [1,2,3,4,5,6,7,8,9,10];

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

    // fetch arrows (last user vote)
    useEffect(() => {
        console.log('loading arrows...');
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
    useEffect(() => {
        if (socket) {
            socket.emit('newStatus', {
                status: value?.data()?.status,
                move: ''
            });
        }
    }, [value?.data()?.status]);

    /*
    handleConnect -> connect client with lgrig via WebSockets
    */
    const handleConnect = async () => {
        console.log('IP: ' + userDoc.data()?.lqrigip);
        setConStat('Loading...');

        try {
            var ipAux = urlSoc;
            if (urlSoc == '' && userDoc.data()?.lqrigip != '') {
                const docRef = doc(db, 'rig', userDoc.data()?.lqrigip);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) ipAux = docSnap.data()?.ip ?? urlSoc;
            }

            console.log('Connecting to: ', ipAux);

            soc = io(ipAux, {
                'reconnect': false,
                'connect_timeout': 2000,
                'transports': ['websocket', 'polling'],
                "query": "mobile=true",
                extraHeaders: {
                    "ngrok-skip-browser-warning": true
                }
            });

            // setErrorText(JSON.stringify(soc));
            setSocket(soc);

            soc.on("connect", () => {
                console.log('Cliente Conectado');
                console.log(soc.id);
                setEnableCon(true); setConStat('Connected');
                soc.emit('currentBoard', {
                    status: value.data().status
                });
            });

            soc.on("connect_error", (err) => {
                console.log(`connect_error due to ${err}`);
                soc.disconnect();
                notify('🚫 Fail'); setConStat('Fail'); setEnableCon(false);
            });

        } catch (err) {
            notify('⚠️ Fatal Error: Refreshing');
            router.reload(window.location.pathname)
        }
    }

    /*
    handleDisconnect -> disconnect client from lgrig
    */
    const handleDisconnect = async () => {
        if (socket) {
            socket.emit('quit');
            socket.disconnect();
            setConStat('Disconnected'); setEnableCon(false);
        }
    }

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

    /* 
    onDrop modification
        we give some extra functions:
            - add move validation
            - save move in the database
    */
    async function onDrop(sourceSquare, targetSquare) {

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


    function DrawerExample({ disp, show, color }) {
        const { isOpen, onOpen, onClose } = useDisclosure()
        const btnRef = React.useRef()

        return (
            <>
                <Button display={disp} disabled={show} ref={btnRef} mt={10} m={1} w={20} size='sm' colorScheme={color} onClick={onOpen} >Demo</Button>
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
                            
                            {plays.map((num) => {
                                return <Text key={num} padding={5} backgroundColor='gray.50' mb={1} borderRadius={10} fontWeight='semibold'
                                _hover={{
                                    transform: 'scale(0.95)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease-in-out'
                                }}
                                onClick={() => {notify('not defined'); onClose()} }
                            >
                                {`Play ${num}`}
                            </Text>
                            }) }

                            
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

    return (
        <VStack h="calc(100vh-3.5rem)" w="100vw" position="absolute">
            {/* Header */}
            <Header />
            {/* Notifications */}
            <Toaster />
            {/* Main */}
            <Flex direction={{ base: 'column-reverse', md: 'column-reverse', lg: 'row' }}>

                {error && <strong>Error: {JSON.stringify(error)}</strong>}
                {loading && <TailSpin type="Puff" color="#808080" height="100%" width="100%" />}

                <VStack mr={5}>
                    {valueVote && userDoc && value &&
                        <Flex
                            align={['center']}
                            justify={['left']}
                            direction={['row']}
                        >
                            {/* <Tag m={1} size='sm' w={100} variant='solid' colorScheme='teal' >Attempts: {userDoc.data()?.limit}</Tag> */}
                            <Badge m={1} size='sm' h={5} w={100} variant='solid' colorScheme='teal'>Attempts: {userDoc.data()?.limit}</Badge>
                            <Button m={1} w={20} size='sm' colorScheme='blue' onClick={onOpen}>Votes</Button>
                            <Button m={1} size='sm' colorScheme={conStat == 'Connected' ? 'green' : 'red'} onClick={handleConnect}>LiquidGalaxy</Button>
                            {conStat == 'Connected' &&
                                <IconButton m={1} colorScheme='red' size='sm' icon={<CloseIcon />} onClick={handleDisconnect} />
                            }
                        </Flex>
                    }
                    {/* LGRig Controller */}
                    {/* {conStat == 'Connected' && */}
                    <VStack display={{ base: (enabledCon ? 'flex' : 'none'), md: 'flex', lg: 'flex' }} align='center' justify='center'>
                        {/* View options */}
                        <HStack >
                            <Button display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} w={20} size='sm' colorScheme='orange' onClick={() => sendInstruction('showChess')}>Chess</Button>
                            <Button display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} w={20} size='sm' colorScheme='orange' onClick={() => sendInstruction('showEarth')}>Earth</Button>
                            <DrawerExample disp={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} show={!enabledCon} color='orange' />
                        </HStack>
                        {/* Chessboard position controls */}
                        <HStack >
                            <Button display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} w={20} h={20} size='md' colorScheme='gray' onClick={() => updateView('white')}>♖</Button>
                            <Button display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} w={20} h={20} size='md' colorScheme='gray' onClick={() => updateView('center')}>
                                <Icon as={MdOutlineCenterFocusWeak} />
                            </Button>
                            <Button display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} w={20} h={20} size='md' colorScheme='gray' onClick={() => updateView('black')}>♜</Button>
                        </HStack>
                        {/* Chessboard vertical position controls */}
                        <HStack >
                            <Button display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} w={20} h={20} size='md' colorScheme='gray' onClick={() => updateView(+0.1)}>↺</Button>
                            <Button display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} w={10} h={20} size='md' colorScheme='gray' onClick={() => updateView(0, +0.1)}>&darr;</Button>
                            <Button display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} w={10} h={20} size='md' colorScheme='gray' onClick={() => updateView(0, -0.1)}>&uarr;</Button>
                            <Button display={enabledCon ? 'block' : { base: 'none', md: 'block', lg: 'block' }} disabled={!enabledCon} mt={10} m={1} w={20} h={20} size='md' colorScheme='gray' onClick={() => updateView(-0.1)}>↻</Button>
                        </HStack >
                    </VStack>
                    {/* } */}

                    {/* JoySticks */}
                    {conStat == 'Connected' &&
                        <HStack m={5} justifyContent={'center'}>
                            <CustomNipple color={enabledCon ? "green" : "gray"}
                                move={(evt, data) => {
                                    try {
                                        if (data.direction['angle'] == 'left') {
                                            sendMove(-5, 0)
                                        } else {
                                            sendMove(+5, 0)
                                        }
                                    } catch (err) { }
                                }} lX={true} lY={false}
                            />
                            <Box display={{base: 'block', md: 'block', lg: 'none'}}>
                                <CustomNipple color={enabledCon ? "blue" : "gray"}
                                    move={(evt, data) => {
                                        try {
                                            if (data.direction['angle'] == 'up') {
                                                sendMove(0, -5)
                                            } else {
                                                sendMove(0, +5)
                                            }
                                        } catch (err) { }
                                    }} lX={false} lY={true}
                                />
                            </Box>
                        </HStack>
                    }

                </VStack>

                <Box align="center">
                    <HStack>
                        {userDoc && <Badge m={1} colorScheme='purple'> LGRig IP: {userDoc.data()?.lqrigip}</Badge>}
                        {value && <Badge m={1} colorScheme={value.data()?.turn == 'w' ? "blue" : "yellow"}>
                            Turn: {value.data()?.turn == 'w' ? "Earth" : "Satellite"}</Badge>}
                    </HStack>

                    {userDoc && value &&
                        <Chessboard
                            boardWidth={isMobile ? (dimensions.width - 20 > 560 ? 340 : dimensions.width - 20) : 500}
                            position={value.data().status}
                            onPieceDrop={onDrop}
                            customDropSquareStyle={{ boxShadow: 'inset 0 0 1px 6px rgba(255,200,100,0.75)' }}
                            animationDuration={500}
                            customArrows={arrow === null ? [] : [arrow]}
                            customBoardStyle={{ borderRadius: '10px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5 ' }}
                        />
                    }
                    {userDoc && value &&
                        <Text mt={3} >Connection Status: {conStat}
                            <Button backgroundColor='white' m={1} w={3} h={3} isLoading={(conStat == 'Loading...')}>
                            </Button>
                        </Text>
                    }
                </Box>

                {conStat == 'Connected' &&
                    <Center mt={280} align="center" justify="sspace-between" display={{base: 'none', md: 'none', lg: 'block'}} >
                        <CustomNipple color={enabledCon ? "blue" : "gray"}
                            move={(evt, data) => {
                                try {
                                    if (data.direction['angle'] == 'up') {
                                        sendMove(0, -5)
                                    } else {
                                        sendMove(0, +5)
                                    }
                                } catch (err) { }
                            }} lX={false} lY={true}
                        />
                    </Center>
                }
            </Flex>

            <Text m={1}></Text>

            {/* Divider */}
            <Text m={10}></Text>

            {/* Show votes */}
            <GetModal
                votes={valueVote?.data()}
                open={isOpen}
                close={onClose}
                iniFR={initialRef}
                finFR={finalRef}
            />
        </VStack>
    )
}


// custom joystick
function CustomNipple({ color, move, lX, lY, display }) {
    return (
        <ReactNipple
            options={{
                color: color,
                lockX: lX,
                lockY: lY,
                mode: "static",
                position: { top: "50%", left: "50%" },
            }}

            display={display}

            style={{
                width: 120,
                height: 120,
                position: "relative"
            }}

            onMove={move}
        >
        </ ReactNipple>
    );
}

function GetModal({ votes, open, close, iniFR, finFR }) {
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