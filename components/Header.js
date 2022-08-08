import { useState, useRef, Component } from 'react';
import {
    Flex, Box, Icon,
    Text, Modal,
    ModalOverlay, ModalContent,
    ModalHeader, ModalCloseButton,
    ModalBody, FormControl,
    FormLabel, Input,
    ModalFooter, useDisclosure,
    HStack, VStack, useColorMode, useColorModeValue
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

import { MdSpaceDashboard } from 'react-icons/md'
import { useDocument, useCollection } from 'react-firebase-hooks/firestore';
import { setGlobalState, useGlobalState } from '../components/socketState';
import { io } from "socket.io-client";

const Header = (props) => {

    // we do not use useState so it wont refresh the page (it will quit the modal!)
    var lqIp = "";
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

        // console.log('IP: ' + userDoc.data()?.lqrigip);
        let ipAux = '';

        try {
            const docRef = doc(db, 'rig', userDoc.data()?.lqrigip);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) ipAux = docSnap.data()?.ip;
            else return;

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

        onClose();
    }

    /*
    handleDisconnect -> disconnect client from lgrig
    */
    const handleDisconnect = async () => {
        if (socket) {
            socket.emit('quit');
            socket.disconnect();
            setSocket(null);
            onClose();
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

    /*
    poweroff -> poweroff the rig
    */
    const poweroff = () => {
        if (socket) {
            socket.emit('poweroff');
        }
    }

    /*
    reboot -> reboot the rig
    */
    const reboot = () => {
        if (socket) {
            socket.emit('reboot');
        }
    }

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
                                <Input placeholder='192.168.0.1' onChange={(e) => lqIp = e.target.value} />
                                <Button color="white" backgroundColor="orange.300" mr={3} onClick={handleSaveIp}>
                                        Save
                                </Button>
                            </HStack>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Hide Logos</FormLabel>
                            <Button onClick={hideLogos}>Hide/Show</Button>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Reboot Rig</FormLabel>
                            <Button colorScheme='yellow' onClick={reboot}>Reboot</Button>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Poweroff Rig</FormLabel>
                            <Button colorScheme='red' onClick={poweroff}>Poweroff</Button>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <VStack>
                            <HStack>

                                <Button colorScheme={socket == null ? 'green' : 'red'} onClick={handleConnect} >
                                    {socket != null ? 'Disconnect' : 'Connect'}
                                </Button>

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
            p={8}
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
                            user.displayName.substring(0,17) + '...' : 
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

            <Box display={{ base: 'block', md: 'none' }} onClick={toggleMenu}>
                {show ? <CloseIcon w={3} h={8} /> : <HamburgerIcon w={5} h={10} />}
            </Box>

            <Box display={{ base: show ? 'block' : 'none', md: 'block' }} flexBasis={{ base: '100%', md: 'auto' }} >
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
                    <CustomButton bgColor={ButtonBg} mbVal={2} mrVal={3} foo={() => { router.push('/about') }} name="About" />
                    <CustomButton bgColor={ButtonBg} mbVal={2} mrVal={3} foo={() => { router.push('/findsat') }} name="FindSat" />
                    <CustomButton bgColor={ButtonBg} mbVal={2} mrVal={3} foo={onOpen} name="LGSettings" />
                    <CustomButton bgColor={ButtonBg} mbVal={0} mrVal={0} foo={handleSignOut} name="SignOut" />
                </Flex>
            </Box>

            <GetModal />
        </Flex>
    );
};

function CustomButton({ mainBtn, bgColor, mbVal, mrVal, foo, name }) {
    return (
        <Button
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