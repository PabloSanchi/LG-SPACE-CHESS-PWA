import { useRouter } from 'next/router';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import Head from 'next/head';
import Header from '../components/Header';

export default function NotFound() {
    
    const router = useRouter();
    
    return (
        <Box>
            <Head>
                <link rel='manifest' href='/manifest.json' />
            </Head>
            <Header />
            <Box textAlign="center" py={40}>
                <Heading
                    display="inline-block"
                    as="h2"
                    size="2xl"
                    bgGradient="linear(to-r, orange.300, orange.600)"
                    backgroundClip="text">
                    404
                </Heading>
                <Text fontSize="18px" mt={3} mb={2}>
                    Page Not Found
                </Text>
                <Text color={'gray.500'} mb={6}>
                    The page you are looking for does not seem to exist
                </Text>

                <Button
                    // colorScheme="teal"
                    bgGradient="linear(to-r, orange.300, orange.600)"
                    color="white"
                    _hover={{
                        bgGradient: "linear(to-r, orange.400, orange.600)",
                        color: "white",
                    }}
                    // variant="solid"
                    onClick={() => router.push('/')}>
                    Go to Home
                </Button>
            </Box>
        </Box>
    );
}