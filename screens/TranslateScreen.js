import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet
} from "react-native";
import { Input, Icon, ListItem } from "react-native-elements";
import { Predictions } from "aws-amplify";
import { SafeAreaView } from "react-navigation";
import styled from "@emotion/native";

import Colors from "../constants/Colors";
import useKeyboardVisible from "../hooks/keyboard-visible";

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
`;

const Container = styled.View`
  flex: 1;
  padding: 24px;
  justify-content: ${props =>
    props.keyboardVisible ? "flex-end" : "space-around"};
`;

const LanguageOptions = styled.View`
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  padding-horizontal: 10px;
`;

const LanguageOption = styled.TouchableOpacity`
  flex: 3;
  border-width: 2px;
  border-color: ${Colors.primary["500"]};
  border-radius: 4px;
  padding: 8px;
`;

const LanguageOptionText = styled.Text`
  text-align: center;
  font-family: montserrat-extra-bold;
  color: ${Colors.primary["500"]};
`;

const LanguageContainer = styled.View`
  justify-content: center;
  padding: 10px;
  flex: 1;
`;

const TranslatedText = styled.Text`
  color: ${Colors.primary["600"]};
  font-family: "montserrat-black";
  font-size: 28px;
`;

export default function TranslateScreen() {
  const [keyboardVisible] = useKeyboardVisible();
  const [showFromLanguagePicker, setShowFromLanguagePicker] = useState(false);
  const [showToLanguagePicker, setShowToLanguagePicker] = useState(false);
  const [selectedFromLanguage, setSelectedFromLanguage] = useState("en");
  const [selectedToLanguage, setSelectedToLanguage] = useState("es");
  const [textToTranslate, setTextToTranslate] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const playAudio = async () => {
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

      // const response = await fetch(`${result.speech.url}`, {
      //   responseType: "arrayBuffer"
      // });

      // const blob = await response.blob();
      // const localUri = `${FileSystem.cacheDirectory}${uuid()}.mp3`;

      // await FileSystem.writeAsStringAsync(localUri, blob);

      // const { sound: soundObject, status } = await Audio.Sound.createAsync(
      //   { uri: localUri },
      //   { shouldPlay: true }
      // );

      console.log({ result });
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
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <Container keyboardVisible={keyboardVisible}>
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
            <View>
              <LanguageOptions>
                <LanguageOption onPress={() => setShowFromLanguagePicker(true)}>
                  <LanguageOptionText>
                    {options[selectedFromLanguage].title}
                  </LanguageOptionText>
                </LanguageOption>
                <View style={{ flex: 1 }}>
                  <Icon
                    size={28}
                    name="arrow-right"
                    type="material-community"
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
            <View style={{ minHeight: 200 }}>
              <LanguageContainer>
                <TranslatedText>{translatedText}</TranslatedText>
              </LanguageContainer>
            </View>
            {keyboardVisible && <View style={{ flex: 1 }} />}
            {/* <ListenButton onPress={playAudio}>
              <Icon
                size={28}
                name="ear-hearing"
                type="material-community"
                color={Colors.primary["500"]}
              />
            </ListenButton> */}
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
                    fontFamily: "montserrat-extra-bold",
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
                    fontFamily: "montserrat-extra-bold",
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
    </React.Fragment>
  );
}

TranslateScreen.navigationOptions = {
  header: null
};

const styles = StyleSheet.create({
  inputContainerStyle: {
    padding: 10,
    borderBottomWidth: 0,
    justifyContent: "center",
    minHeight: 200
  },
  inputStyle: {
    fontSize: 28,
    color: Colors.primary["600"],
    fontFamily: "montserrat-black",
    alignSelf: "center",
    paddingTop: 0
  }
});
