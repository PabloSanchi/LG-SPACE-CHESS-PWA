import '../styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import Login from '../components/Login';
import { auth } from '../firebase'
import { useAuthState } from 'react-firebase-hooks/auth';
import React from 'react'

function MyApp({ Component, pageProps }) {

  const [user, loading] = useAuthState(auth);

  if(loading) return (<ChakraProvider></ChakraProvider>)
  if(!user && !loading) return (
    <ChakraProvider>
      <Login />
    </ChakraProvider>
  )
  else return( <ChakraProvider> <Component {...pageProps} /> </ChakraProvider> )
}

export default MyApp