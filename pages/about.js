import React from 'react'
import { Text, Flex  } from '@chakra-ui/react';
import Head from 'next/head'

import AboutBody from '../components/AboutBody';


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

            <AboutBody />
            <Flex h={10} align='center' textAlign='center' backgroundColor="black" noOfLines={2}>
                <Text color="white" >Liquid Galaxy Space Chess</Text> 
            </Flex>
        </div>
    )
}



export default about