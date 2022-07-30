import React from 'react'
import { VStack, Text, HStack, Box } from '@chakra-ui/react';
import Head from 'next/head'
import Header from '../components/Header';
import Image from 'next/image';
import LQlogo from '../public/logoLg.png';
import FirebaseIcon from '../public/firebaseLogo.png';
import Gsoc from '../public/logoGsoc.png';
import Spl from '../public/Spl.png';

function about() {
    return (
        <div>
            <Head>
                <title>About</title>
                <meta name="description" content="" />
                <link rel="icon" href="/favicon.ico" />
                <link rel='manifest' href='/manifest.json' />
            </Head>

            <Header />

            <VStack >
                {/* <Image src={Spc} width="2000" height="2000" /> */}
                {/* <Text maxW={'6xl'} fontSize={30} >Liquid Galaxy Space Chess</Text> */}
                <Image w={45} h={20} src={Spl} alt="main logo"></Image>
                <Text maxW={'6xl'} p={5} >
                    A Newspace related visualization project in collaboration with Hydra-Space.
                    The basic idea is to use the Liquid Galaxy cluster as a handler and visualizer of a world chess game
                    that will happen with people around the world and through satellite communications, a world&apos;s first !!!
                </Text>
                <Text maxW={'6xl'} p={5} >
                    Two teams, the Earth (you) and the Space (a strong AI) <br/>
                    Every day the Earth makes one move, the most common move between you all, so play as a community and
                    not as an individual.
                    <br /><br />
                    Once the Earth has made the move, wait for the Space.
                    The satellite has its own orbit so you may not see its move in hours, so be patient.
                </Text>

                {/* templateColumns="repeat(2, 0.5fr)" gap={2} */}
                <HStack maxW={'lg'} p={10} >
                    <Image p={20} src={LQlogo} alt="lq logo"></Image>
                    <Image p={20} src={Gsoc} alt="main gsoc"></Image>
                </HStack>

            </VStack>
        </div>
    )
}

export default about