import React, {useEffect} from 'react';
import Head from 'next/head'
import dynamic from 'next/dynamic';
import { Button, Text } from '@chakra-ui/react';

import { setGlobalState, useGlobalState } from '../components/socketState';

const ChessGui = dynamic(() => import('../components/DisplayChess'), {
  ssr: false
});


export default function Home() {
  
  const changeVal = () => {
    setGlobalState('color', 'red');
  }

  return (
    <div>
      <Head>
        <title>Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel='manifest' href='/manifest.json' />
        <meta content='yes' name='apple-mobile-web-app-capable'/>
        <meta content='yes' name='mobile-web-app-capable'/>
      </Head>
      <ChessGui />
    </div>
  )
}