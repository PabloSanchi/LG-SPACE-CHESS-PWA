import { useState, useRef } from 'react';
import { Flex, Box, Icon, 
        Text, Modal, 
        ModalOverlay, ModalContent, 
        ModalHeader, ModalCloseButton, 
        ModalBody, FormControl, 
        FormLabel, Input, 
        ModalFooter, useDisclosure, 
        HStack, VStack } from '@chakra-ui/react';

import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Button } from '@chakra-ui/react'
import toast, { Toaster } from 'react-hot-toast';
import { auth, logout, db } from "../firebase";
import { collection, updateDoc, doc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { isIPV4Address } from "ip-address-validator";
import Link from "next/link"; 

import { FaHome } from 'react-icons/fa';
import { MdSpaceDashboard } from 'react-icons/md'

const Header = (props) => {

    // we do not use useState so it wont refresh the page (it will quit the modal!)
    var lqIp = "";

    const router = useRouter();
    const [user, loadingUser] = useAuthState(auth);
    const [show, setShow] = useState(false);
    const toggleMenu = () => setShow(!show);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const initialRef = useRef(null);
    const finalRef = useRef(null);

    const notify = (text) => toast(text);

    const handleSignOut = () => {
        router.push('/');
        logout();
    }

    const handleSaveIp = async () => {
        if (!isIPV4Address(lqIp)) {
            notify('❌ Invalid IP Address');
            return;
        }

        while(loadingUser) {} // waiting for auth hook

        updateDoc(doc(collection(db, "users"), user.uid), {
            lqrigip: lqIp,
        }).then(() => {
            notify('✅ IP ADDED ');
        }).catch(() => {
            notify('❌ Retry');
        });

        onClose();
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
                            <FormLabel>Enter LGRig IP</FormLabel>
                            <Input placeholder='192.168.0.1' onChange={(e) => lqIp = e.target.value} />
                        </FormControl>

                    </ModalBody>

                    <ModalFooter>
                        <VStack>
                            <HStack>
                                <Button color="white" backgroundColor="#CD853F" mr={3} onClick={handleSaveIp}>
                                    Save
                                </Button>
                                <Button onClick={onClose}>Cancel</Button>
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
            bgGradient='linear(to-r, #CD853F, #DAA520)'
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
                    <Text fontSize="lg" fontWeight="bold" noOfLines={1} onClick={() => router.push('/') }>
                        <Flex align="center" gap={1}> LG SPACE CHESS</Flex>
                    </Text>
                    <Text>{user?.email ? user.displayName : JSON.stringify(user)}</Text>
                </Box>
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

                    <CustomButton mbVal={2} mrVal={3} foo={() => { router.push('/about') }} name="About" />
                    <CustomButton mbVal={2} mrVal={3} foo={() => { router.push('/findsat') }} name="FindSat" />
                    <CustomButton mbVal={2} mrVal={3} foo={onOpen} name="LGSettings" />
                    <CustomButton mbVal={0} mrVal={0} foo={handleSignOut} name="SignOut" />
                </Flex>
            </Box>

            <GetModal />
        </Flex>
    );
};

function CustomButton({ mbVal, mrVal, foo, name}) {
    return (
        <Button
            color="orange.800"
            backgroundColor="white"
            width="100%"
            mb = {{ base: mbVal, sm: 0 }}
            mr = {{ base: 0, sm: mrVal }}
            
            onClick={foo}
        >{name}
        </Button>
    )
}

export default Header;