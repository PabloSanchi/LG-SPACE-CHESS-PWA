import '../styles/globals.css'
import { ChakraProvider, ColorModeProvider, useColorMode } from '@chakra-ui/react'
import Login from '../components/Login';
import { auth } from '../firebase'
import { useAuthState } from 'react-firebase-hooks/auth';
import React, { useState } from 'react'
import Header from '../components/Header';
import theme from '../utils/theme';

function MyApp({ Component, pageProps }) {

  const [user, loading] = useAuthState(auth);

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

export default MyApp