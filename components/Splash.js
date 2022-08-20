import React, { useState } from 'react'
import Image from 'next/image'
import logos from '../public/logos.png';
import { Center, VStack, HStack, Box, Flex, Text } from '@chakra-ui/react';


function Splash({ setShown }) {

  useState(() => {
    setTimeout(() => {
      setShown(true);
    }, 1000);
  });

  return (
    <Flex mt={{base: '10rem', md: '8rem', lg: '1rem'}} direction="column" alignItems="center" >
      <VStack
        spacing={8}
        alignItems="center"
      >
        <Image width={764-200} height={758-200} src={logos} alt="main logo"></Image>
      </VStack>
    </Flex> 
  )
}

      export default Splash;