import {
    Box,
    Container,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
export default function SmallWithSocial({props}) {
    return (
        <Box
            bg={useColorModeValue('black', 'red.900')}
            color={useColorModeValue('white', 'gray.200')}>
            <Container
                as={Stack}
                maxW={'6xl'}
                py={4}
                direction={{ base: 'column', md: 'row' }}
                spacing={4}
                justify={{ base: 'center', md: 'space-between' }}
                align={{ base: 'center', md: 'center' }}>
                <Text>© 2022 Liquid Galaxy Space Chess & Hydra Space</Text>
            </Container>
        </Box>
    );
}