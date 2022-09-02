import { useState, useRef, Component } from 'react';
import {
    Flex, Box, Icon,
    Text, Modal,
    ModalOverlay, ModalContent,
    ModalHeader, ModalCloseButton,
    ModalBody, FormControl,
    FormLabel, Input,
    ModalFooter, useDisclosure,
    HStack, VStack, useColorMode, useColorModeValue, AlertDialogCloseButton
} from '@chakra-ui/react';

import { CloseIcon, HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Button, IconButton } from '@chakra-ui/react'
import toast, { Toaster } from 'react-hot-toast';
import { auth, logout, db } from "../firebase";
import { collection, updateDoc, doc, getDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { isIPV4Address } from "ip-address-validator";
import Link from "next/link";

import { MdNotificationsPaused, MdSpaceDashboard } from 'react-icons/md'
import { useDocument, useCollection } from 'react-firebase-hooks/firestore';
import { setGlobalState, useGlobalState } from '../components/socketState';
import { io } from "socket.io-client";


import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react'


const Header = (props) => {

    const [showPlaying] = useGlobalState('showPlaying');
    // const setShowPlaying = (value) => { setGlobalState('showPlaying', value); }

    // we do not use useState so it wont refresh the page (it will quit the modal!)
    var lqIp = '';
    // color Mode
    const { toggleColorMode } = useColorMode();
    // #DAA520
    // const bgColor = useColorModeValue('orange', 'orange');
    const bgColor = useColorModeValue('orange', 'dark');
    const themeLogo = useColorModeValue(<MoonIcon />, <SunIcon />);
    const ButtonBg = useColorModeValue('white', 'orange.300');
    const mainBtn = useColorModeValue('blue', 'white');

    const router = useRouter();
    const [user, loadingUser] = useAuthState(auth);
    const [show, setShow] = useState(false);
    const toggleMenu = () => setShow(!show);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const initialRef = useRef(null);
    const finalRef = useRef(null);

    // sockets variables
    let soc = null;
    const [socket] = useGlobalState('socket');
    const setSocket = (soc) => {
        setGlobalState('socket', soc);
    }

    // fetch the user doc (uid, displayName, lgrigip, vote limit, ...)
    const [userDoc, loadingUserDoc, errorUserDoc] = useDocument(
        doc(db, 'users', user?.uid),
        {
            snapshotListenOptions: { includeMetadataChanges: true },
        }
    );

    // fetch chessboard status
    const [value, loading, error] = useDocument(
        doc(db, 'chess', 'ChessBoardStatus'),
        {
            snapshotListenOptions: { includeMetadataChanges: true },
        }
    );


    const notify = (text) => toast(text);

    const handleSignOut = () => {
        handleDisconnect();
        router.push('/');
        logout();
    }

    const handleSaveIp = async () => {
        if (!isIPV4Address(lqIp)) {
            notify('❌ Invalid IP Address');
            return;
        }

        while (loadingUser) { } // waiting for auth hook

        updateDoc(doc(collection(db, "users"), user.uid), {
            lqrigip: lqIp,
        }).then(() => {
            notify('✅ IP ADDED ');
        }).catch(() => {
            notify('❌ Retry');
        });

        lqIp = '';

        onClose();
    }

    /*
    handleConnect -> connect client with lgrig via WebSockets
    */
    const handleConnect = async () => {

        console.log(socket);

        if (socket !== null) {
            handleDisconnect();
            return;
        }
        
        let ipAux = '';

        try {

            if (lqIp !== '') {

                if (!isIPV4Address(lqIp)) {
                    notify('❌ Invalid IP Address');
                    return;
                }

                ipAux = lqIp;
                await handleSaveIp();

                const docRef = doc(db, 'rig', ipAux);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) ipAux = docSnap.data()?.ip;
                else {
                    notify('IP not found');
                    return;
                };

            } else {
        
                const docRef = doc(db, 'rig', userDoc.data()?.lqrigip);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) ipAux = docSnap.data()?.ip;
                else {
                    notify('IP not found');
                    return;
                };
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

            soc.on("connect", () => {
                // setErrorText(JSON.stringify(soc));
                setSocket(soc);
                notify('Connected');
                console.log('Cliente Conectado');
                console.log(soc.id);
                onClose();
                // soc.emit('currentBoard', {
                //     status: value.data().status
                // });
            });

            soc.on("connect_error", (err) => {
                console.log(`connect_error due to ${err}`);
                soc.disconnect();
                notify('🚫 Fail');
                setSocket(null);
            });

        } catch (err) {
            notify('⚠️ Fatal Error: Refreshing');
            console.log('err')
            // router.reload(window.location.pathname)
        }

        lqIp = '';
    }

    /*
    handleDisconnect -> disconnect client from lgrig
    */
    const handleDisconnect = async () => {
        if (socket) {
            socket.emit('quit');
            socket.disconnect();
            setSocket(null);
            // onClose();
        }
    }

    /*
    hideLogos -> hide logos from the screen
    */
    const hideLogos = () => {
        if (socket) {
            socket.emit('hideLogos');
        }
    }

    /**
    * @description poweroff -> poweroff the rig
    */
    const poweroff = () => {
        if (socket) {
            socket.emit('poweroff');
        }
    }

    /**
    * @description reboot -> reboot the rig
    */
    const reboot = () => {
        if (socket) {
            socket.emit('reboot');
        }
    }

    /**
    * @description reboot -> reboot the rig
    */
    const relaunch = () => {
        if (socket) {
            socket.emit('relaunch');
        }
    }

    /**
    * @description resetScreens -> Stop everything and reset the screens
    */
    const resetScreens = () => {
        console.log('reseting screens');
        if (socket) {
            socket.emit('killAll');
        }
    }

    /**
    * @type component
    * @description LGStetting modal
    */
    const GetModal = () => {
        return (
            <Modal
                initialFocusRef={initialRef}
                finalFocusRef={finalRef}
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>LG Settings</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel>LGRig IP</FormLabel>
                            <HStack>
                                <Input disabled={socket !== null ? true : false} placeholder={userDoc?.data()?.lqrigip ? userDoc?.data()?.lqrigip : 'e.g. 192.168.0.1'} onChange={(e) => lqIp = e.target.value} />
                                <Button colorScheme={socket == null ? 'green' : 'red'} onClick={handleConnect} >
                                    {socket != null ? 'Disconnect' : 'Connect'}
                                </Button>
                                {/* <Button color="white" backgroundColor="orange.300" mr={3} onClick={handleSaveIp}>
                                    Save
                                </Button> */}
                            </HStack>
                        </FormControl>

                        <FormControl mt={2}>
                            <FormLabel>LG Logos</FormLabel>
                            <Button onClick={hideLogos}>Hide/Show</Button>
                        </FormControl>

                        <FormControl mt={2}>
                            <HStack>
                                <VStack>
                                    <FormLabel>Reboot Rig</FormLabel>
                                    <CustomAskButton disbled={false} bgColor={ButtonBg} mbVal={2} mrVal={3} foo={reboot} name="Reboot" />
                                </VStack>
                                <VStack>
                                    <FormLabel>Relaunch Rig</FormLabel>
                                    <CustomAskButton disbled={false} bgColor={ButtonBg} mbVal={2} mrVal={3} foo={relaunch} name="Reboot" />
                                </VStack>
                            </HStack>
                            
                        </FormControl>

                        <FormControl mt={2}>
                            <FormLabel>Poweroff Rig</FormLabel>
                            <CustomAskButton disbled={false} bgColor={ButtonBg} mbVal={2} mrVal={3} foo={poweroff} name="Poweroff" />
                        </FormControl>

                    </ModalBody>

                    <ModalFooter>
                        <VStack>
                            <HStack>
                                {/* <Button colorScheme='red' onClick={resetScreens}>Hard Reset</Button> */}
                                {/* <Button colorScheme={socket == null ? 'green' : 'red'} onClick={handleConnect} >
                                    {socket != null ? 'Disconnect' : 'Connect'}
                                </Button> */}
                                <Button onClick={onClose}>Close</Button>
                            </HStack>
                        </VStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        )
    }

    return (
        <Flex
            color='white'
            bgColor={bgColor}
            mb={1}
            p={5}
            as="nav"
            align="center"
            justify="space-between"
            wrap="wrap"
            w="100%"
        >
            <Toaster />
            <HStack
                onClick={() => router.push('/')}
                align='center'
                justify='center'
                direction='row'
                w="255"
                _hover={{
                    transform: 'scale(0.95)',
                    cursor: "pointer",
                    transition: 'transform 0.2s ease-in-out'
                }}
            >
                <Box mr={3}>
                    <Icon w={10} h={10} as={MdSpaceDashboard} />
                </Box>
                <Box>
                    <Text fontSize="lg" fontWeight="bold" noOfLines={1} onClick={() => router.push('/')}>
                        <Flex align="center" gap={1}> LG SPACE CHESS</Flex>
                    </Text>

                    <Text>{user?.email ?
                        (user.displayName.length > 17 ?
                            user.displayName.substring(0, 17) + '...' :
                            user.displayName)
                        : ' '}
                    </Text>
                </Box>
                <Text
                    textTransform={'uppercase'}
                    color={socket != null ? 'green.400' : 'red.400'}
                    fontWeight={600}
                    fontSize={['sm', 'md', 'lg']}
                    bg={useColorModeValue('white', 'blue.900')}
                    p={2}
                    alignSelf={'flex-start'}
                    rounded={'lg'}>
                    {socket != null ? 'ON' : 'OFF'}
                </Text>
            </HStack>

            <Box display={{ base: 'block', md: 'block', lg: 'none'}} onClick={toggleMenu}>
                {show ? <CloseIcon w={3} h={8} /> : <HamburgerIcon w={5} h={10} />}
            </Box>

            <Box mt={{base: 2, md: 2, lg: 0}} display={{ base: show ? 'block' : 'none', md: show ? 'block' : 'none', lg: 'block' }} flexBasis={{ base: '100%', md: '100%', lg: 'auto' }} >
                <Flex
                    align="center"
                    justify={['center', 'space-between', 'flex-end', 'flex-end']}
                    direction={['column', 'row', 'row', 'row']}
                    pt={[4, 4, 0, 0]}
                >
                    <Box borderRadius={10} p={2} bgColor={bgColor} _hover={{ cursor: 'pointer' }} onClick={toggleColorMode} mb={{ base: 2, sm: 0 }}
                        mr={{ base: 0, sm: 5 }}>
                        {themeLogo}
                    </Box>

                    <CustomButton disabled={showPlaying} bgColor={ButtonBg} mbVal={2} mrVal={3} foo={() => { router.push('/') }} name="Board" />
                    <CustomButton disabled={showPlaying} bgColor={ButtonBg} mbVal={2} mrVal={3} foo={() => { router.push('/findsat') }} name="FindSat" />
                    <CustomButton disabled={showPlaying} bgColor={ButtonBg} mbVal={2} mrVal={3} foo={onOpen} name="LGSettings" />

                    {/* <CustomSignOut scheme='blue' name='SignOut' foo={handleSignOut} /> */}
                    <CustomAskButton disabled={showPlaying} bgColor={ButtonBg} mbVal={2} mrVal={3} foo={handleSignOut} name="SignOut" />

                    <CustomButton disabled={showPlaying} bgColor={ButtonBg} mbVal={0} mrVal={0} foo={() => { router.push('/about') }} name="About" />
                </Flex>
            </Box>

            <GetModal />
        </Flex>
    );
};

function CustomAskButton({ disabled, bgColor, mbVal, mrVal, foo, name }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef()

    return (
        <>
            <Button
                disabled={disabled}
                color={(name != 'Poweroff' && name != 'Reboot' && 'Relaunch' && bgColor == "white" ? "orange.800" : "white")}
                backgroundColor={(name == 'Poweroff' || name == 'Reboot' || name == 'Relaunch' ? 'orange': bgColor)}
                width={name == 'Poweroff' || name == 'Reboot' || name == 'Relaunch' ? 'auto' : '100%'}
                mb={{ base: mbVal, sm: 0 }}
                mr={{ base: 0, sm: mrVal }}
                onClick={onOpen}
            >{name}
            </Button>
            <AlertDialog
                motionPreset='scale'
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isOpen={isOpen}
                isCentered
            >
                <AlertDialogOverlay />

                <AlertDialogContent>
                    <AlertDialogHeader>Wish to proceed?</AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody>
                        You are about to {name.toLowerCase()}
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            No
                        </Button>
                        <Button colorScheme='red' ml={3} onClick={foo}>
                            Yes
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}


function CustomButton({ disabled, bgColor, mbVal, mrVal, foo, name }) {
    return (
        <Button
            disabled={disabled}
            color={bgColor == "white" ? "orange.800" : "white"}
            backgroundColor={bgColor}
            width="100%"
            mb={{ base: mbVal, sm: 0 }}
            mr={{ base: 0, sm: mrVal }}
            onClick={foo}
        >{name}
        </Button>
    )
}

export default Header;