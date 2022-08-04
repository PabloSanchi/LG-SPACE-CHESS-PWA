import React from 'react'
import { VStack, Text, HStack, Box, Icon, Flex, Link, Divider  } from '@chakra-ui/react';
import Head from 'next/head'
import Header from '../components/Header';
import Image from 'next/image';
import LQlogo from '../public/logoLg.png';
import Gsoc from '../public/logoGsoc.png';
import Spl from '../public/Spl.png';


import { setGlobalState, useGlobalState } from '../components/socketState';


import { FaGithub, FaEnvelope, FaLinkedinIn } from 'react-icons/fa';

function SocialMediaButton({ where, icon, text }) {
    return (
        <Flex align="center" gap={1}>
            <Icon as={icon} />
            <Link href={where} isExternal fontSize='2xl'>{text}</Link>
        </Flex>
    )
}

function about() {

    return (
        <div>
            <Head>
                <title>About</title>
                <meta name="description" content="" />
                <link rel="icon" href="/favicon.ico" />
                <link rel='manifest' href='/manifest.json' />
                <meta content='yes' name='apple-mobile-web-app-capable'/>
                <meta content='yes' name='mobile-web-app-capable'/>
            </Head>

            {/* <Header /> */}

            <VStack>
                {/* Project logo */}
                <Image w={45} h={20} src={Spl} alt="main logo"></Image>
                {/* Author name */}
                <Text fontSize='xl' fontWeight='bold'>Author: Pablo {`Sanchidri\u00E1n`}</Text>
                {/* Mentor name */}
                <Text fontSize='xl' fontWeight='bold'>Mentor: {`V\u00EDctor`} {`S\u00E1nchez`}</Text>
                <Divider w={120} orientation='horizontal' />
                {/* Author contact */}
                <Text fontSize='xl' >Author Contact info:</Text>
                <Box display={{ base: 'block', md: 'block' }} flexBasis={{ base: '100%', md: 'auto' }} >
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

                {/* Logos */}
                <HStack maxW={'lg'} p={10} >
                    <Image p={20} src={LQlogo} alt="lq logo"></Image>
                    <Image p={20} src={Gsoc} alt="main gsoc"></Image>
                </HStack>

                {/* Project Description */}
                <Text maxW={'3xl'} p={5} >
                    A Newspace-related visualization project in collaboration with Hydra-Space.
                    The basic idea is to use the Liquid Galaxy cluster to visualize a world chess game that will happen 
                    with people worldwide and through satellite communications, a world&apos;s first !!!
                    <br/><br/>
                    Two teams, the Earth (you) and the Space (a strong AI)
                    Every day the Earth makes, at least, one move,
                    the most common move among you all, so play as a community and not as an individual.
                    <br/><br/>
                    Once the Earth has made a move, wait for Space.
                    The satellite has its own orbit so you may not see it move in hours, so be patient.
                </Text>

            </VStack>

            <Flex h={10} align='center' textAlign='center' backgroundColor="black" noOfLines={2}>
                <Text color="white" >@Liquid Galaxy Space Chess 2022</Text> 
            </Flex>
        </div>
    )
}



export default about