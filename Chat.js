import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  YellowBox,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Entypo from "react-native-vector-icons/Entypo";
import * as actions from "../actions";
import { TextInput } from "react-native-gesture-handler";
import firebase from "../Firebase/Firebase";
import { connect } from "react-redux";
import {
  GiftedChat,
  Bubble,
  Send,
  InputToolbar,
} from "react-native-gifted-chat";

const createTag = {};
const Chat = (props) => {
  const {
    browseHashtags,
    resetHashtags,
    hashtags,
    tags,
    error,
    viewer,
    hasMore,
    navigation,
    queryFilters,
  } = props;

  const followerData = props.route.params.senderData;
  const usersData = props.route.params.userData;
  const [chatid, setChatid] = React.useState();

  const [allmessageData, setAllmessageData] = React.useState();
  const [loading, setLoading] = React.useState(true);
  YellowBox.ignoreWarnings(["Setting a timer"]);

  const alldata = [];
  const chatAvatar = usersData.imageURL.small
    ? usersData.imageURL.small.url
    : "";
  const [messages, setMessages] = React.useState([
    {
      _id: 1,
      text: props.route.params.senderData.givenName + "  Joined the chat",
    },
  ]);
  const db = firebase.firestore();

  useEffect(() => {
    const userID = props.route.params.userData.id;
    const chateeID = props.route.params.senderData.id;
    const chatIDpre = [];
    chatIDpre.push(userID);
    chatIDpre.push(chateeID);
    chatIDpre.sort();
    const chatterId = chatIDpre.join("_");
    const chatIDer = chatterId;
    setChatid(chatIDer);
    const messagesListener = firebase
      .firestore()
      .collection("CHAT")
      .doc(chatIDer)
      .collection("MESSAGES")
      .orderBy("createdAt", "desc")
      .onSnapshot((querySnapshot) => {
        const messages = querySnapshot.docs.map((doc) => {
          const firebaseData = doc.data();
          const data = {
            _id: doc.id,
            text: "",
            createdAt: new Date().getTime(),
            ...firebaseData,
          };
          if (!firebaseData.system) {
            data.user = {
              ...firebaseData.user,
              name: firebaseData.user.name,
              avatar: firebaseData.user.avatar,
            };
          }

          return data;
        });

        setMessages(messages);
      });

    // Stop listening for updates whenever the component unmounts
    return () => messagesListener();
  }, []);

  async function handleSend(messages) {
    const text = messages[0].text;
    db.collection("CHAT")
      .doc(chatid)
      .collection("MESSAGES")
      .add({
        text,
        createdAt: new Date().getTime(),
        user: {
          name: props.route.params.userData.givenName,
          _id: props.route.params.userData.id,
          avatar: chatAvatar,
        },
      });

    await db
      .collection("CHAT")
      .doc(chatid)
      .set(
        {
          latestMessage: {
            text,
            createdAt: new Date().getTime(),
          },
        },
        { merge: true }
      );
  }

  // render bubble
  function renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#16D1BC",
            width: "75%",
            borderRadius: 10,
            borderBottomRightRadius: 0,
            marginBottom: 18,
          },
          left: {
            backgroundColor: "#685BFF",
            width: "75%",
            borderRadius: 10,
            borderBottomLeftRadius: 0,
            marginBottom: 5,
          },
        }}
        textStyle={{
          right: {
            fontSize: 14,
            fontFamily: "Ubuntu-Light",
            color: "#fff",
          },
          left: {
            fontSize: 14,
            fontFamily: "Ubuntu-Light",
            color: "#fff",
          },
        }}
      />
    );
  }

  // send message
  function renderSend(props) {
    return (
      <Send {...props}>
        <View style={{ padding: 6 }}>
          <Entypo name="paper-plane" size={30} color="#fff" />
        </View>
      </Send>
    );
  }

  // chat screen toolbar
  function renderToolbar(props) {
    return <InputToolbar {...props} containerStyle={styles.inputToolbar} />;
  }

  // chat composer
  function renderComposer(props) {
    return (
      <View
        style={{
          backgroundColor: "#996EFF",
          flex: 1,
          width: "80%",
          marginBottom: 3,
          marginLeft: 10,
          paddingHorizontal: 5,
          borderRadius: 50,
        }}
      >
        <TextInput
          {...props}
          style={{ padding: 5, fontFamily: "Ubuntu-Light" }}
        />
      </View>
    );
  }

  function NewHeader() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text
          style={{
            color: "#fff",
            fontFamily: "Ubuntu-Light",
            fontWeight: "normal",
            letterSpacing: 1,
            fontSize: 13,
            fontWeight: "bold",
          }}
        >
          {props.route.params.senderData.givenName}
        </Text>
      </View>
    );
  }
  navigation.setOptions({
    headerTitle: (props) => <NewHeader {...props} />,
  });

  return (
    <GiftedChat
      messages={messages}
      onSend={handleSend}
      renderBubble={renderBubble}
      renderSend={renderSend}
      renderInputToolbar={renderToolbar}
      //renderComposer={renderComposer}
      alwaysShowSend={true}
      user={{
        name: props.route.params.userData.givenName,
        _id: props.route.params.userData.id,
        avatar: props.route.params.userData?.imageURL?.large?.url,
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },

  bigText: { color: "#fff", fontSize: 30 },
  SmallText: { color: "#fff", fontSize: 15 },
  landingText: { color: "#fff", fontSize: 15, marginTop: 10 },
  roundImage: {
    width: 40,
    height: 40,
    borderRadius: 80,
    padding: 5,
    margin: 5,
    backgroundColor: "#adadad",
  },
  dashboardImages: {
    width: 60,
    height: 60,
  },
  sendingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  inputToolbar: {
    backgroundColor: "#8C6AFF",
    paddingVertical: 5,
  },
});

export default Chat;
