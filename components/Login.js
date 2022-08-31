import React from "react";
import { signInWithGoogle, auth, logout } from "../firebase";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import {
  Box,
  Stack,
  Heading,
  Text,
  Container,
  Button,
  SimpleGrid,
  Center,
  Flex
} from "@chakra-ui/react";
import Spl from "../public/Spl2.png";
import Spl2 from "../public/Spl3.png";
import Head from "next/head";
import { useColorMode, useColorModeValue } from "@chakra-ui/react";

export default function Login() {
  const mainLogo = useColorModeValue(Spl, Spl2);
  const bgColor = useColorModeValue("gray.50", "whiteAlpha.50");
  const color = useColorModeValue("gray.500", "white");

  const handleLogin = () => {
    signInWithGoogle();
  };

  return (
    <>
      <Box p={5} position={"relative"} align="center">
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <meta content="yes" name="apple-mobile-web-app-capable" />
          <meta content="yes" name="mobile-web-app-capable" />
        </Head>
        <Container
          as={SimpleGrid}
          maxW={"7xl"}
          columns={{ base: 1, md: 2 }}
          spacing={{ base: 10, lg: 32 }}
          py={{ base: 10, sm: 20, lg: 32 }}
        >
          <Stack spacing={{ base: 10, md: 20 }}>
            <Heading
              lineHeight={1.1}
              fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
            >
              LG SPACE CHESS
              <br />
              <Text
                as={"span"}
                bgGradient="linear(to-r, #CD853F,pink.800)"
                bgClip="text"
                fontSize="20px"
              >
                Liquid Galaxy & Hydra-Space & Hybridium
              </Text>
            </Heading>

            <Image viewBox="5 0 100 100" src={mainLogo} alt="main logo"></Image>
          </Stack>
          <Stack
            bg={bgColor}
            rounded={"xl"}
            p={{ base: 4, sm: 6, md: 8 }}
            spacing={{ base: 8 }}
            maxW={{ lg: "lg" }}
          >
            <Stack spacing={4}>
              <Heading
                color={useColorModeValue("dark", "white")}
                lineHeight={1.1}
                fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
              >
                Join the chess community
                <Text
                  as={"span"}
                  bgGradient="linear(to-r, red.700,pink.800)"
                  bgClip="text"
                >
                  !
                </Text>
              </Heading>
              <Text color={color} fontSize={{ base: "sm", sm: "md" }}>
                This is the new way to play chess, but now, as a community. Do
                not hesitate and share it on social media!!!
              </Text>
            </Stack>
            <Box as={"form"} mt={10}>
              <Stack spacing={4}>
                <Button
                  w={"full"}
                  variant={"outline"}
                  leftIcon={<FcGoogle />}
                  onClick={handleLogin}
                  color="white"
                  bgColor={"#CD853F"}
                  // bgGradient="linear(to-r, purple.600,red.600)"
                  _hover={{
                    color: "white",
                    bgGradient: "linear(to-r, #CD853F, #FF8C00)",
                    boxShadow: "xl",
                  }}
                >
                  <Center>
                    <Text>Google auth</Text>
                  </Center>
                </Button>

                <Text fontSize='xs'>
                Liquid Galaxy undertakes not to trade your personal data with any other entity.<br/>
                We have access only to your public info: Image, Name, Email, Provider.<br />
                We ask for your google account to identify you so you can save important data for LG Space Chess
                such as the IP, remaining attempts, and your vote.
                </Text>

              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
}