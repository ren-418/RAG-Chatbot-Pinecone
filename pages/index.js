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
  Tooltip,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon, ArrowUpIcon, HamburgerIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";
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

  // Color palette for dark theme, inspired by ChatGPT UI
  const chatgptDark = {
    bgApp: "#202123", // Main app background, sidebar
    bgInputAndResponse: "#343541", // For response bubbles, input background
    bgQuery: "#444654", // For query bubbles, active sidebar chat
    textPrimary: "gray.100",
    buttonIconDefault: "whiteAlpha.900", // Default icon color for ghost buttons
    borderColorSubtle: "transparent",
    scrollbarTrack: "#343541",
    scrollbarThumb: "#555663",
    sendButtonBg: "white",
    sendButtonIcon: "black",
    hamburgerBg: "transparent", // Hamburger icon background (transparent in dark mode)
    hamburgerIcon: "white", // Hamburger icon color
  };

  // Color palette for light theme, inspired by ChatGPT UI
  const chatgptLight = {
    bgApp: "#FFFFFF", // Main app background
    bgSidebar: "#F7F7F8", // Sidebar background
    bgInputAndResponse: "#F7F7F8", // Input background, response bubble background
    bgQuery: "#E0E0E0", // Query bubble background, active sidebar chat
    textPrimary: "gray.800",
    buttonIconDefault: "gray.700", // Default icon color for ghost buttons
    borderColorSubtle: "transparent",
    scrollbarTrack: "#E0E0E0",
    scrollbarThumb: "#B0B0B0",
    sendButtonBg: "black",
    sendButtonIcon: "white",
    hamburgerBg: "white", // Hamburger icon background
    hamburgerIcon: "gray.700", // Hamburger icon color
  };

  const queryBackgroundColor = useColorModeValue(chatgptLight.bgQuery, chatgptDark.bgQuery);
  const responseBackgroundColor = useColorModeValue(chatgptLight.bgInputAndResponse, chatgptDark.bgInputAndResponse);
  const textColor = useColorModeValue(chatgptLight.textPrimary, chatgptDark.textPrimary);
  const buttonScheme = useColorModeValue(chatgptLight.buttonNeutral, chatgptDark.buttonNeutral);
  const sidebarBg = useColorModeValue(chatgptLight.bgSidebar, chatgptDark.bgApp);
  const mainBg = useColorModeValue(chatgptLight.bgApp, chatgptDark.bgApp);
  const currentSendButtonBg = useColorModeValue(chatgptLight.sendButtonBg, chatgptDark.sendButtonBg);
  const currentSendButtonIconColor = useColorModeValue(chatgptLight.sendButtonIcon, chatgptDark.sendButtonIcon);

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
    <Box minH="100vh" bg={mainBg} color={textColor}>
      <Head>
        <title>RAG FAQ Chatbot</title>
        <meta name="description" content="RAG FAQ Chatbot" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={sidebarBg} borderRight="0" borderColor={useColorModeValue(chatgptLight.borderColorSubtle, chatgptDark.borderColorSubtle)}>
          <DrawerHeader borderBottomWidth="0" borderColor={useColorModeValue(chatgptLight.borderColorSubtle, chatgptDark.borderColorSubtle)}>
            <HStack justify="space-between" w="full" px={2}>
              <Heading size="md">Chats</Heading>
              <Tooltip label="New Chat">
                <IconButton
                  aria-label="New chat"
                  icon={<AddIcon />}
                  size="sm"
                  onClick={createNewChat}
                  color="white" // Always white for add icon, matches the image regardless of theme
                  variant="ghost"
                  _hover={{ bg: "transparent" }}
                />
              </Tooltip>
            </HStack>
          </DrawerHeader>

          <DrawerBody p={0}>
            <VStack align="stretch" spacing={0} border="none">
              {chats.map((chat) => (
                <HStack
                  key={chat.id}
                  px={4}
                  py={3}
                  bg={activeChat === chat.id ? useColorModeValue(chatgptLight.bgQuery, chatgptDark.bgQuery) : "transparent"}
                  _hover={{ bg: "transparent" }}
                  cursor="pointer"
                  onClick={() => {
                    setActiveChat(chat.id);
                    onClose();
                  }}
                  justify="space-between"
                >
                  <Text noOfLines={1} flex={1} color={textColor}>
                    {conversations[chat.id]?.title || "New Chat"}
                  </Text>
                  {chats.length > 1 && (
                    <Tooltip label="Delete chat">
                      <IconButton
                        aria-label="Delete chat"
                        icon={<DeleteIcon />}
                        size="xs"
                        variant="ghost"
                        color={textColor} // Use textColor for the delete icon
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        _hover={{ bg: "transparent" }}
                      />
                    </Tooltip>
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
          <Tooltip label="Menu">
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon color={useColorModeValue(chatgptLight.hamburgerIcon, chatgptDark.hamburgerIcon)} />}
              onClick={onOpen}
              bg={useColorModeValue(chatgptLight.hamburgerBg, chatgptDark.hamburgerBg)}
              variant="ghost"
              borderRadius="xl"
              _hover={{ bg: "transparent" }}
            />
          </Tooltip>
        </Box>

        {/* Chat Container */}
        <Container maxW="container.xl" py={8} px={4}>
          <VStack spacing={6} h="full" border="none">
            <HStack justifyContent="space-between" w="full" pt={12}>
              <Heading as="h1" size="xl" color={textColor}>
                RAG FAQ Chatbot
              </Heading>
              <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
                <IconButton
                  aria-label="Toggle color mode"
                  icon={colorMode === "light" ? <MoonIcon color={textColor} /> : <SunIcon color={textColor} />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  colorScheme={buttonScheme}
                  borderRadius="xl"
                  _hover={{ bg: "transparent" }}
                />
              </Tooltip>
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
              bg={mainBg}
              css={{
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: useColorModeValue(chatgptLight.scrollbarTrack, chatgptDark.scrollbarTrack),
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: useColorModeValue(chatgptLight.scrollbarThumb, chatgptDark.scrollbarThumb),
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
                    borderWidth="0"
                    boxShadow="sm"
                  >
                    <Text color={textColor}>{item.message}</Text>
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
                    borderWidth="0"
                    boxShadow="sm"
                  >
                    <HStack>
                      <Spinner size="sm" color={textColor} />
                      <Text color={textColor}>Thinking...</Text>
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
                bg={useColorModeValue(chatgptLight.bgInputAndResponse, chatgptDark.bgInputAndResponse)}
                borderWidth="0"
                borderRadius="full"
                borderColor={useColorModeValue(chatgptLight.borderColorSubtle, chatgptDark.borderColorSubtle)}
                _focus={{
                  borderColor: useColorModeValue(chatgptLight.borderColorSubtle, chatgptDark.borderColorSubtle),
                  boxShadow: "none",
                }}
                size="lg"
                px={6}
                color={textColor}
              />
              <Tooltip label={isLoading ? "Stop" : "Send message"}>
                <IconButton
                  type="submit"
                  aria-label={isLoading ? "Stop" : "Send message"}
                  icon={isLoading ? <SquareCircleIcon color={currentSendButtonIconColor} /> : <ArrowUpIcon color={currentSendButtonIconColor} />}
                  bg={currentSendButtonBg}
                  color={currentSendButtonIconColor}
                  borderWidth="0"
                  borderRadius="full"
                  size="lg"
                  _hover={{}}
                  transition="none"
                  onClick={isLoading ? () => setIsLoading(false) : undefined}
                />
              </Tooltip>
            </HStack>
          </VStack>
        </Container>
      </Flex>
    </Box>
  );
}
