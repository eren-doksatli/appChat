import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  Divider,
  FAB,
  List,
  Portal,
  TextInput,
} from "react-native-paper";
import firebase from "firebase/compat/app";
import { useNavigation } from "@react-navigation/native";

export default function ChatList() {
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const [email, setEmail] = useState("");

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setEmail(user?.email ?? "");
    });
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const createChat = async () => {
    if (!email || !userEmail) return;
    setIsLoading(true);
    const response = await firebase
      .firestore()
      .collection("chats")
      .add({
        users: [email, userEmail],
      });
    setIsLoading(false);
    setIsDialogVisible(false);
    navigation.navigate("Chat", { chatId: response.id });
  };

  const [chats, setChats] = useState([]);
  useEffect(() => {
    return firebase
      .firestore()
      .collection("chats")
      .where("users", "array-contains", email)
      .onSnapshot((QuerySnapshot) => {
        setChats(QuerySnapshot.docs);
      });
  }, [email]);

  return (
    <View style={{ flex: 1, marginLeft: 10 }}>
      {chats.map((chat) => (
        <React.Fragment key={chat.id}>
          <List.Item
            title={chat.data().users.find((x) => x !== email)}
            description={(chat.data().messages ?? [])[0]?.text ?? undefined}
            left={() => (
              <Avatar.Text
                label={chat
                  .data()
                  .users.find((x) => x !== email)
                  .split(" ")
                  .reduce((prev, current) => prev + current[0], "")}
                size={56}
              />
            )}
            onPress={() => navigation.navigate("Chat", { chatId: chat.id })}
          />
          <Divider inset />
        </React.Fragment>
      ))}

      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setIsDialogVisible(false)}
        >
          <Dialog.Title>New Chat</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Enter user e-mail"
              value={userEmail}
              onChangeText={(text) => setUserEmail(text)}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => createChat()} loading={isLoading}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        onPress={() => setIsDialogVisible(true)}
        icon="plus"
        style={{ position: "absolute", bottom: 16, right: 16 }}
      />
    </View>
  );
}
