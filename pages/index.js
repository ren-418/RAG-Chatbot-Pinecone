import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useColorMode,
  useColorModeValue,
  IconButton,
  Heading,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

export default function Home() {
  const chatBoxRef = useRef(null);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const { colorMode, toggleColorMode } = useColorMode();

  const queryBackgroundColor = useColorModeValue("gray.100", "gray.700");
  const responseBackgroundColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const buttonScheme = useColorModeValue("gray", "gray"); // Using gray for buttons

  useEffect(() => {
    if (conversation.length > 0 && chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = { type: "query", message };
    setConversation((prevConversation) => [...prevConversation, newMessage]);
    setMessage(""); // Clear message immediately for better UX

    // Call query function directly after setting the message
    await query(message);
  };

  const query = async (currentMessage) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentMessage }),
      });

      if (!res.ok) {
        throw new Error("There was an error submitting this message!");
      }
      const { response } = await res.json();

      setConversation((prevConversation) => [
        ...prevConversation,
        { type: "response", message: response.response },
      ]);
    } catch (err) {
      console.error("Error during API call:", err);
      setConversation((prevConversation) => [
        ...prevConversation,
        {
          type: "response",
          message: "There was an error, can you try asking again?",
        },
      ]);
    }
  };

  return (
    <Flex
      minH="100vh"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue("white", "gray.900")}
      color={textColor}
      py={8}
    >
      <Head>
        <title>Demo Chatbot</title>
        <meta name="description" content="Demo chatbot" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <VStack spacing={4} w="full" maxW="lg" p={4}>
        <HStack justifyContent="space-between" w="full">
          <Heading as="h1" size="xl">
            Demo Chatbot
          </Heading>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            colorScheme={buttonScheme}
          />
        </HStack>

        <VStack
          ref={chatBoxRef}
          spacing={3}
          align="stretch"
          w="full"
          h="400px"
          overflowY="auto"
          borderWidth="1px"
          borderRadius="lg"
          p={4}
          bg={useColorModeValue("white", "gray.800")}
          css={{
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: useColorModeValue("gray.100", "gray.700"),
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: useColorModeValue("gray.400", "gray.500"),
              borderRadius: "10px",
            },
          }}
        >
          {conversation.map((item, index) => (
            <Flex
              key={index}
              justifyContent={item.type === "query" ? "flex-end" : "flex-start"}
            >
              <Box
                bg={item.type === "query" ? queryBackgroundColor : responseBackgroundColor}
                px={4}
                py={2}
                borderRadius="lg"
                maxW="70%"
              >
                <Text>{item.message}</Text>
              </Box>
            </Flex>
          ))}
        </VStack>

        <HStack as="form" onSubmit={handleSubmit} w="full">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSubmit(e);
              }
            }}
            bg={useColorModeValue("gray.50", "gray.700")}
            borderColor={useColorModeValue("gray.200", "gray.600")}
            _focus={{
              borderColor: useColorModeValue("gray.400", "gray.500"),
              boxShadow: "outline",
            }}
          />
          <Button type="submit" colorScheme={buttonScheme} px={8}>
            Submit
          </Button>
        </HStack>
      </VStack>
    </Flex>
  );
}
