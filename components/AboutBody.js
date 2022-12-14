import React from 'react'
import { VStack, Text, HStack, Box, Icon, Flex, Link, Divider  } from '@chakra-ui/react';
import Image from 'next/image';

import Spl from '../public/Spl2.png';
import Spl2 from '../public/Spl3.png';
import logos from '../public/logos.png';
import logo from '../public/noSpace.png';

import { useColorModeValue } from '@chakra-ui/react';
import { FaGithub, FaEnvelope, FaLinkedinIn } from 'react-icons/fa';

function SocialMediaButton({ where, icon, text }) {
    return (
        <Flex align="center" gap={1}>
            <Icon as={icon} />
            <Link href={where} isExternal fontSize='2xl'>{text}</Link>
        </Flex>
    )
}

function AboutBody() {

    const mainLogo = useColorModeValue(Spl,Spl2);

    return (
        <VStack>
            {/* WEB LOGO */}
            <Image width={350} height={150} src={mainLogo} alt="main logo"></Image>
            <Divider w={120} orientation='horizontal' />
            {/* Author name */}
            <Text mt={3} fontSize='xl' fontWeight='bold'>Author: Pablo {`Sanchidri\u00E1n`}</Text>
            <Divider w={120} orientation='horizontal' />
            {/* Mentor name */}
            <VStack fontSize='xl' fontWeight='bold'>
                <Text >Mentors:</Text>
                <Text>{`V\u00EDctor`} {`S\u00E1nchez`}</Text>
                <Text>Andreu {`Iba\u00f1ez`}</Text>
            </VStack>
            <Divider w={120} orientation='horizontal' />
            {/* Liquid galaxy tester */}
            <Text mt={3} fontSize='xl' fontWeight='bold'>Lleida Liquid Galaxy Lab<br/> Support: Pau Francino</Text>
            <Divider w={120} orientation='horizontal' />
            {/* Author contact */}
            <Text fontWeight='bold' fontSize='xl' >Author Contact info:</Text>
            <Box display={{ base: 'block', md: 'block' }} flexBasis={{ base: '100%', md: 'auto' }} mb={5} >
                <Flex
                    align="center"
                    justify={['center', 'space-between', 'flex-end', 'flex-end']}
                    direction={['column', 'row', 'row', 'row']}
                    pt={[4, 4, 0, 0]}
                    gap={4}
                >
                    <SocialMediaButton where='mailto:pablo.sanchi.herrera@gmail.com' icon={FaEnvelope} text='Mail' />
                    <SocialMediaButton where='https://github.com/PabloSanchi' icon={FaGithub} text='GitHub' />
                    <SocialMediaButton where='https://www.linkedin.com/in/pablosanchidrian' icon={FaLinkedinIn} text='LinkedIn' />
                </Flex>
            </Box>
            <Divider w={120} orientation='horizontal' />
            
            {/* Logos */}
            <Box mt={3}>
                <Image padding={5} width={650-100} height={493-100} src={logo} alt="main logo"></Image>
            </Box>
            
            {/* Project Description */}
            <Divider w={120} orientation='horizontal' />
            <Text fontSize={{base: '18px', md: '20px', lg: '25px'}} maxW={'3xl'} p={5} >
                A Newspace-related visualization project in collaboration with Hydra-Space & Hybridium.
                The basic idea is to use the Liquid Galaxy cluster to visualize a world chess game that will happen
                with people worldwide and through satellite communications, a world&apos;s first !!!
                <br /><br />
                Two teams, the Earth (you) and the Space (a strong AI)
                Every day the Earth makes, at least, one move,
                the most common move among you all, so play as a community and not as an individual.
                <br /><br />
                Once the Earth has made a move, wait for Space.
                The satellite has its own orbit so you may not see it move in hours, so be patient.
            </Text>

        </VStack>
    )
}

export default AboutBody

