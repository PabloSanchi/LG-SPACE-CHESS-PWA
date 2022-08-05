import React, { useState } from 'react'
import Image from 'next/image'
import logos from '../public/logos.png';
import { Center, Flex, Text } from '@chakra-ui/react';


function Splash({ setShown }) {

  useState(() => {
    setTimeout(() => {
      setShown(true);
    }, 1000);
  });
  
  return (
    <Center  style={{
      position: 'relative'
    }}
    p={10} direction='column' justify='center' align='center' >
      <Image style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        // transform  : 'translate(-50%, -50%)'
      }}
      width={764} height={758} src={logos} alt="main logo"></Image>
    </Center>
  )
}

export default Splash;