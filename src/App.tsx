import { auth, db } from "./firebase";

import { useAuthState } from "react-firebase-hooks/auth";
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  Text,
  Textarea,
  Tooltip,
} from "@chakra-ui/react";
import { GoogleAuthProvider, User, signInWithRedirect } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import moment from "moment";
import { RiLogoutBoxRLine } from "react-icons/ri";

export default function App() {
  const [user] = useAuthState(auth);

  // console.log(user);

  return (
    <main>
      <Container maxW={"container.sm"}>
        <Navbar user={user} />
        {!user ? <Welcome /> : <Chat />}
      </Container>
    </main>
  );
}

function Navbar({ user }: { user: User | null | undefined }) {
  const signOut = () => {
    auth.signOut();
  };

  return (
    <Flex
      justifyContent={"space-between"}
      alignItems={"center"}
      borderBottom={"2px"}
      borderColor={"gray.600"}
      padding={"10px 0"}
      position={"fixed"}
      width={"container.sm"}
      bg={"gray.800"}
      zIndex={10}
    >
      <Flex alignItems={"center"} gap={2}>
        <Heading as="h4" size="md">
          React Chat
        </Heading>
        {/* <Button onClick={toggleColorMode}>
          {colorMode === "light" ? <BsMoonStarsFill /> : <BsSunFill />}
        </Button> */}
      </Flex>
      <div>
        {user && (
          <Tooltip label="Logout">
            <Button onClick={signOut}>
              <RiLogoutBoxRLine />
            </Button>
          </Tooltip>
        )}
      </div>
    </Flex>
  );
}

function Welcome() {
  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };
  return (
    <Box textAlign={"center"}>
      <Text>
        This application represents a straightforward messaging platform
        developed using the React.js framework for front-end design and
        Firebase, a robust backend service, to facilitate real-time messaging
        capabilities, user authentication, and data storage
      </Text>
      <Button leftIcon={<FcGoogle size={25} />} onClick={googleSignIn}>
        Continue with Google
      </Button>
    </Box>
  );
}

function Chat() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textAreaRef.current?.style) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setLoading(true);
      if (message.trim() === "") {
        return;
      }
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "messages"), {
          text: message,
          name: user.displayName,
          avatar: user.photoURL,
          createdAt: serverTimestamp(),
          uid: user?.uid,
        });
      }
      setMessage("");
      setLoading(false);
      if (textAreaRef.current?.style) {
        textAreaRef.current.style.height = "auto";
      }

      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Box paddingTop={20}></Box>
      <Messages />
      <Box paddingTop={20}></Box>
      <div>
        <Box
          sx={{
            position: "fixed",
            bottom: 5,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
          }}
          paddingX={4}
          paddingY={2}
          maxW={"container.sm"}
          borderWidth={2}
          bg={"gray.800"}
          borderRadius={"xl"}
          borderColor={"purple.600"}
        >
          <form style={{ width: "100%" }}>
            <Textarea
              onKeyDown={handleKeyDown}
              ref={textAreaRef}
              variant={"unstyled"}
              resize={"none"}
              onChange={handleChange}
              value={message}
              disabled={loading}
              placeholder="Type your message 'shit+enter' to add line"
              style={{ maxHeight: 120 }}
              rows={1}
            />
          </form>
        </Box>
      </div>
      <div ref={scrollRef}></div>
    </>
  );
}

type Message = {
  id: string;
  avatar: string;
  createdAt: Date;
  name: string;
  text: string;
  uid: string;
};

function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // console.log("Running 1");

    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc"),
      limit(50),
    );

    const unsubscribe: () => void = onSnapshot(q, (querySnapshot) => {
      // console.log("Running 2");
      const fetchedMessages: Message[] = [];

      querySnapshot.forEach((doc) => {
        fetchedMessages.push({
          id: doc.id,
          avatar: doc.data().avatar,
          createdAt: doc.data().createdAt.toDate(),
          name: doc.data().name,
          text: doc.data().text,
          uid: doc.data().uid,
        });
      });

      const sortedMessages = fetchedMessages.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      setMessages(sortedMessages);
    });

    return unsubscribe;
  }, []);

  const user = auth.currentUser;

  return (
    <>
      {messages.map((message) => {
        const isMyMessage = message.uid === user?.uid;
        return (
          <HStack
            alignItems={"start"}
            marginBottom={3}
            flexDirection={isMyMessage ? "row-reverse" : "row"}
          >
            <Avatar src={message.avatar} name={message.name} size={"md"} />
            <Box
              padding={3}
              borderWidth={1}
              borderRadius={"xl"}
              borderTopLeftRadius={!isMyMessage ? 0 : "xl"}
              borderTopRightRadius={isMyMessage ? 0 : "xl"}
              bg={isMyMessage ? "purple.600" : "gray.700"}
              maxW={"sm"}
            >
              <Flex gap={2}>
                <Heading as="h6" size={"xs"}>
                  {message.name}
                </Heading>
                <Text fontSize={"xs"}>
                  {moment(message.createdAt).startOf("hour").fromNow()}
                </Text>
              </Flex>
              <Text whiteSpace={"pre-line"}>{message.text}</Text>
            </Box>
          </HStack>
        );
      })}
    </>
  );
}
