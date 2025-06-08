import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import '../styles/globals.css'

const styles = {
  global: (props) => ({
    body: {
      bg: mode('white', '#1A202C')(props), // Lighter background for light mode, darker for dark mode
    },
  }),
};

const colors = {
  brand: {
    50: '#f0f0f0',
    100: '#e0e0e0',
    200: '#d0d0d0',
    300: '#c0c0c0',
    400: '#b0b0b0',
    500: '#a0a0a0',
    600: '#909090',
    700: '#808080',
    800: '#333333',
    900: '#1A202C',
  },
};

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const theme = extendTheme({ config, styles, colors });

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp
