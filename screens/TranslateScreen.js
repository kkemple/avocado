import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  StatusBar
} from "react-native";
import { Input, ListItem, Icon } from "react-native-elements";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Predictions } from "aws-amplify";
import { SafeAreaView } from "react-navigation";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import uuid from "uuid/v4";
import styled from "@emotion/native";

import Colors from "../constants/Colors";

const options = {
  en: {
    title: "English",
    voice: "Salli"
  },
  fr: {
    title: "French",
    voice: "Chantal"
  },
  es: {
    title: "Spanish",
    voice: "Penelope"
  },
  pt: {
    title: "Portugese",
    voice: "Vitoria"
  },
  zh: {
    title: "Chinese",
    voice: "Zhiyu"
  },
  ar: {
    title: "Arabic",
    voice: "Zeina"
  },
  da: {
    title: "Danish",
    voice: "Naja"
  },
  nl: {
    title: "Dutch",
    voice: "Lotte"
  },
  hi: {
    title: "Hindi",
    voice: "Aditi"
  },
  it: {
    title: "Italian",
    voice: "Carla"
  },
  ja: {
    title: "Japanese",
    voice: "Mizuki"
  },
  ko: {
    title: "Korean",
    voice: "Seoyeon"
  },
  no: {
    title: "Norwegian",
    voice: "Liv"
  },
  pl: {
    title: "Polish",
    voice: "Ewa"
  },
  ru: {
    title: "Russian",
    voice: "Tatyana"
  },
  sv: {
    title: "Swedish",
    voice: "Astrid"
  },
  tr: {
    title: "Turkish",
    voice: "Filiz"
  }
};

const suggestions = [
  "Does this go to ",
  "Do you speak ",
  "Where is the bathroom?",
  "Check, please!",
  "Do you take credit cards?",
  "Is tip included?",
  "Please",
  "Thank you",
  "Excuse me",
  "Call the ambulance",
  "I am hurt",
  "I need a hospital",
  "Call the police"
];

const ListenButton = styled.TouchableOpacity`
  align-items: center;
  background-color: ${Colors.grey["0"]};
  border-radius: 32px;
  bottom: 16px;
  box-shadow: 1px 1px 1px ${Colors.shadow};
  height: 64px;
  justify-content: center;
  margin: 8px;
  position: absolute;
  right: 16px;
  width: 64px;
  elevation: 2;
`;

const Container = styled.View`
  flex: 1;
  padding: 24px;
  justify-content: flex-start;
`;

const LanguageOptions = styled.View`
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  padding-horizontal: 10px;
`;

const LanguageOption = styled.TouchableOpacity``;

const LanguageOptionText = styled.Text`
  text-align: center;
  font-family: montserrat-bold;
  color: ${Colors.primary["500"]};
`;

const LanguageContainer = styled.View`
  padding: 10px;
  flex: 1;
`;

const TranslatedText = styled.Text`
  color: ${Colors.primary["600"]};
  font-family: "montserrat-extra-bold";
  font-size: 24px;
`;

export default function TranslateScreen() {
  const [showSuggestionsPicker, setShowSuggestionsPicker] = useState(false);
  const [showFromLanguagePicker, setShowFromLanguagePicker] = useState(false);
  const [showToLanguagePicker, setShowToLanguagePicker] = useState(false);
  const [selectedFromLanguage, setSelectedFromLanguage] = useState("en");
  const [selectedToLanguage, setSelectedToLanguage] = useState("es");
  const [textToTranslate, setTextToTranslate] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const playAudio = async () => {
    const soundObject = new Audio.Sound();

    try {
      const result = await Predictions.convert({
        textToSpeech: {
          source: {
            text: translatedText,
            language: selectedToLanguage
          },
          voiceId: options[selectedToLanguage].voice
        }
      });

      const soundBuffer = Buffer.from(result.audioStream).toString("base64");
      const id = uuid();

      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}${id}.mp3`,
        soundBuffer,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      await soundObject.loadAsync({
        uri: `${FileSystem.documentDirectory}${id}.mp3`
      });

      await soundObject.playAsync();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const translate = async () => {
      try {
        if (textToTranslate.length < 2) {
          setTranslatedText("");
          return;
        }
        const result = await Predictions.convert({
          translateText: {
            source: {
              text: textToTranslate,
              language: selectedFromLanguage
            },
            targetLanguage: selectedToLanguage
          }
        });

        setTranslatedText(result.text);
      } catch (error) {
        console.log(error);
      }
    };

    translate();
  }, [
    textToTranslate,
    setTextToTranslate,
    selectedFromLanguage,
    selectedToLanguage,
    setSelectedToLanguage,
    setSelectedFromLanguage
  ]);

  return (
    <React.Fragment>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <Container>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16
              }}
            >
              <View>
                <LanguageOptions>
                  <LanguageOption
                    onPress={() => setShowFromLanguagePicker(true)}
                  >
                    <LanguageOptionText>
                      {options[selectedFromLanguage].title}
                    </LanguageOptionText>
                  </LanguageOption>
                  <View style={{ paddingHorizontal: 8 }}>
                    <MaterialCommunityIcons
                      style={{ marginBottom: -2 }}
                      size={16}
                      name="arrow-right"
                      color={Colors.primary["500"]}
                    />
                  </View>
                  <LanguageOption onPress={() => setShowToLanguagePicker(true)}>
                    <LanguageOptionText>
                      {options[selectedToLanguage].title}
                    </LanguageOptionText>
                  </LanguageOption>
                </LanguageOptions>
              </View>
              <View>
                <LanguageOption onPress={() => setShowSuggestionsPicker(true)}>
                  <LanguageOptionText>
                    Suggested{" "}
                    <MaterialCommunityIcons
                      name="chevron-down"
                      color={Colors.primary["500"]}
                    />
                  </LanguageOptionText>
                </LanguageOption>
              </View>
            </View>
            <View>
              <Input
                autoFocus
                multiline
                blurOnSubmit
                returnKeyType="done"
                placeholder="Translate"
                value={textToTranslate}
                onChangeText={text => setTextToTranslate(text)}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={styles.inputStyle}
              />
            </View>
            <View style={{ flex: 1 }}>
              <LanguageContainer>
                <TranslatedText>{translatedText}</TranslatedText>
              </LanguageContainer>
            </View>
            <ListenButton onPress={playAudio}>
              <Icon
                size={28}
                name="ear-hearing"
                type="material-community"
                color={Colors.primary["500"]}
              />
            </ListenButton>
          </Container>
        </SafeAreaView>
      </KeyboardAvoidingView>
      <Modal visible={showFromLanguagePicker} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 24 }}
          >
            {Object.keys(options).map(option => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSelectedFromLanguage(option);
                  setShowFromLanguagePicker(false);
                }}
              >
                <ListItem
                  titleStyle={{
                    fontFamily: "montserrat-bold",
                    color: Colors.primary["500"]
                  }}
                  bottomDivider
                  title={options[option].title}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      <Modal visible={showToLanguagePicker} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 24 }}
          >
            {Object.keys(options).map(option => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSelectedToLanguage(option);
                  setShowToLanguagePicker(false);
                }}
              >
                <ListItem
                  titleStyle={{
                    fontFamily: "montserrat-bold",
                    color: Colors.primary["500"]
                  }}
                  bottomDivider
                  title={options[option].title}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      <Modal visible={showSuggestionsPicker} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 24 }}
          >
            {suggestions.map(option => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setTextToTranslate(option);
                  setShowSuggestionsPicker(false);
                }}
              >
                <ListItem
                  titleStyle={{
                    fontFamily: "montserrat-bold",
                    color: Colors.primary["500"]
                  }}
                  bottomDivider
                  title={option}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </React.Fragment>
  );
}

TranslateScreen.navigationOptions = {
  header: null
};

const styles = StyleSheet.create({
  inputContainerStyle: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary["300"],
    paddingVertical: 8,
    alignItems: "flex-start"
  },
  inputStyle: {
    fontSize: 24,
    color: Colors.primary["600"],
    fontFamily: "montserrat-bold",
    paddingTop: 0,
    alignSelf: "flex-start",
    minHeight: 20
  }
});
