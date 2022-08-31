import '../styles/globals.css'
import { ChakraProvider, ColorModeProvider, useColorMode } from '@chakra-ui/react'
import Login from '../components/Login';
import { auth } from '../firebase'
import { useAuthState } from 'react-firebase-hooks/auth';
import React, { useState, useRef } from 'react'
import Header from '../components/Header';
import theme from '../utils/theme';
import logos from '../public/logos.png';
import Splash from '../components/Splash';

function MyApp({ Component, pageProps }) {
  const [shown, setShown] = useState(false);
  const [user, loading] = useAuthState(auth);

  if(!shown) {
    return ( 
      <ChakraProvider>
        <Splash setShown={setShown} />
      </ChakraProvider>
    );
  }

  if(shown) {

    if (loading) return (<ChakraProvider></ChakraProvider>)
    if (!user && !loading) return (
      <ChakraProvider resetCSS theme={theme}>  
        <Login />
      </ChakraProvider>
    )
    else return (
      <ChakraProvider resetCSS cssVarsRoot="body" theme={theme}>
          <Header /><Component {...pageProps} /> 
      </ChakraProvider>)

  }
}

export default MyApp