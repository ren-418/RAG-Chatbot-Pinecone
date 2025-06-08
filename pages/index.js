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
  Spinner,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Container,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon, ArrowUpIcon, HamburgerIcon, AddIcon, DeleteIcon, CloseIcon } from "@chakra-ui/icons";
import { SquareCircleIcon } from '@primer/octicons-react';

export default function Home() {
  const chatBoxRef = useRef(null);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState({
    1: { title: "New Chat", messages: [] }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState([{ id: 1, title: "New Chat" }]);
  const [activeChat, setActiveChat] = useState(1);
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: false });

  const queryBackgroundColor = useColorModeValue("gray.100", "gray.700");
  const responseBackgroundColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const buttonScheme = useColorModeValue("gray", "gray");

  // New theme colors based on user's images
  const mainBg = useColorModeValue("gray.50", "gray.900");
  const sidebarBg = useColorModeValue("white", "gray.800");
  const inputBg = useColorModeValue("white", "gray.700");
  const sendButtonBg = useColorModeValue("gray.800", "white");
  const sendButtonIconColor = useColorModeValue("white", "gray.800");

  useEffect(() => {
    if (conversations[activeChat]?.messages.length > 0 && chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [conversations, activeChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = { type: "query", message };
    setConversations(prev => ({
      ...prev,
      [activeChat]: {
        ...prev[activeChat],
        messages: [...(prev[activeChat]?.messages || []), newMessage],
        title: prev[activeChat]?.messages.length === 0 ? message.slice(0, 30) + "..." : prev[activeChat].title
      }
    }));
    setMessage("");
    setIsLoading(true);

    await query(message);
    setIsLoading(false);
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

      setConversations(prev => ({
        ...prev,
        [activeChat]: {
          ...prev[activeChat],
          messages: [...prev[activeChat].messages, { type: "response", message: response.response }]
        }
      }));
    } catch (err) {
      console.error("Error during API call:", err);
      setConversations(prev => ({
        ...prev,
        [activeChat]: {
          ...prev[activeChat],
          messages: [...prev[activeChat].messages, {
            type: "response",
            message: "There was an error, can you try asking again?"
          }]
        }
      }));
    }
  };

  const createNewChat = () => {
    const newChatId = Math.max(...chats.map(chat => chat.id)) + 1;
    setChats([...chats, { id: newChatId, title: "New Chat" }]);
    setConversations(prev => ({
      ...prev,
      [newChatId]: { title: "New Chat", messages: [] }
    }));
    setActiveChat(newChatId);
  };

  const deleteChat = (chatId) => {
    if (chats.length === 1) return; // Prevent deleting the last chat

    const newChats = chats.filter(chat => chat.id !== chatId);
    const newConversations = { ...conversations };
    delete newConversations[chatId];

    setChats(newChats);
    setConversations(newConversations);

    // Switch to the first available chat
    setActiveChat(newChats[0].id);
  };

  return (
    <Box minH="100vh" bg={mainBg}>
      <Head>
        <title>RAG FAQ Chatbot</title>
        <meta name="description" content="RAG FAQ Chatbot" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={sidebarBg} borderRight="1px" borderColor={useColorModeValue("gray.200", "gray.700")}>
          <DrawerHeader borderBottomWidth="1px" borderColor={useColorModeValue("gray.200", "gray.700")}>
            <HStack justify="space-between" w="full" px={2}>
              <Heading size="md">Chats</Heading>
              <HStack spacing={2}>
                <IconButton
                  aria-label="New chat"
                  icon={<AddIcon />}
                  size="sm"
                  onClick={createNewChat}
                  colorScheme={buttonScheme}
                  variant="ghost"
                />
                <IconButton
                  aria-label="Close sidebar"
                  icon={<CloseIcon />}
                  size="sm"
                  onClick={onClose}
                  colorScheme={buttonScheme}
                  variant="ghost"
                />
              </HStack>
            </HStack>
          </DrawerHeader>

          <DrawerBody p={0}>
            <VStack align="stretch" spacing={0} border="none">
              {chats.map((chat) => (
                <HStack
                  key={chat.id}
                  px={4}
                  py={3}
                  bg={activeChat === chat.id ? useColorModeValue("gray.100", "gray.700") : "transparent"}
                  cursor="pointer"
                  onClick={() => {
                    setActiveChat(chat.id);
                    onClose();
                  }}
                  justify="space-between"
                >
                  <Text noOfLines={1} flex={1}>
                    {conversations[chat.id]?.title || "New Chat"}
                  </Text>
                  {chats.length > 1 && (
                    <IconButton
                      aria-label="Delete chat"
                      icon={<DeleteIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                    />
                  )}
                </HStack>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Flex h="100vh">
        {/* Sidebar Toggle */}
        <Box position="fixed" top={4} left={4} zIndex={1}>
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            onClick={onOpen}
            colorScheme={buttonScheme}
            variant="ghost"
            borderRadius="xl"
          />
        </Box>

        {/* Chat Container */}
        <Container maxW="container.xl" py={8} px={4}>
          <VStack spacing={6} h="full" border="none">
            <HStack justifyContent="space-between" w="full" pt={12}>
              <Heading as="h1" size="xl">
                RAG FAQ Chatbot
              </Heading>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                colorScheme={buttonScheme}
                borderRadius="xl"
              />
            </HStack>

            <VStack
              ref={chatBoxRef}
              spacing={4}
              align="stretch"
              w="full"
              flex={1}
              overflowY="auto"
              borderWidth="0"
              borderRadius="2xl"
              p={6}
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
              {conversations[activeChat]?.messages.map((item, index) => (
                <Flex
                  key={index}
                  justifyContent={item.type === "query" ? "flex-end" : "flex-start"}
                >
                  <Box
                    bg={item.type === "query" ? queryBackgroundColor : responseBackgroundColor}
                    px={6}
                    py={3}
                    borderRadius="xl"
                    maxW="70%"
                    borderWidth="1px"
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                    boxShadow="sm"
                  >
                    <Text>{item.message}</Text>
                  </Box>
                </Flex>
              ))}
              {isLoading && (
                <Flex justifyContent="flex-start">
                  <Box
                    bg={responseBackgroundColor}
                    px={6}
                    py={3}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                    boxShadow="sm"
                  >
                    <HStack>
                      <Spinner size="sm" />
                      <Text>Thinking...</Text>
                    </HStack>
                  </Box>
                </Flex>
              )}
            </VStack>

            <HStack as="form" onSubmit={handleSubmit} w="full" spacing={4}>
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleSubmit(e);
                  }
                }}
                bg={inputBg}
                borderWidth="2px"
                borderRadius="full"
                borderColor={useColorModeValue("gray.200", "gray.600")}
                _focus={{
                  borderColor: useColorModeValue("gray.400", "gray.500"),
                  boxShadow: "none",
                }}
                size="lg"
                px={6}
              />
              <IconButton
                type="submit"
                aria-label={isLoading ? "Stop" : "Send message"}
                icon={isLoading ? <SquareCircleIcon /> : <ArrowUpIcon />}
                bg={sendButtonBg}
                color={sendButtonIconColor}
                borderWidth="2px"
                borderRadius="full"
                size="lg"
                borderColor={useColorModeValue("gray.200", "gray.600")}
                onClick={isLoading ? () => setIsLoading(false) : undefined}
              />
            </HStack>
          </VStack>
        </Container>
      </Flex>
    </Box>
  );
}
