import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Text,
  Modal,
  ScrollView
} from "react-native";
import { Input, Icon, ListItem } from "react-native-elements";
import { Predictions } from "aws-amplify";
import { SafeAreaView } from "react-navigation";

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

export default function TranslateScreen() {
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

      // const response = await fetch(result.speech.url, {
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 24 }}>
        <KeyboardAvoidingView style={{ flex: 1 }}>
          <View style={{ flex: 5 }}>
            <Input
              // autoFocus
              multiline
              blurOnSubmit
              returnKeyType="done"
              value={textToTranslate}
              onChangeText={text => setTextToTranslate(text)}
              inputContainerStyle={{
                padding: 8,
                borderColor: Colors.primary["200"],
                borderWidth: 2,
                borderBottomWidth: 2,
                borderRadius: 4,
                height: "100%",
                alignItems: "flex-start"
              }}
              inputStyle={{
                fontSize: 28,
                height: "100%",
                color: Colors.primary["600"],
                fontFamily: "overpass-black",
                alignSelf: "flex-start",
                paddingTop: 0
              }}
            />
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <View
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row",
                paddingHorizontal: 10
              }}
            >
              <TouchableOpacity
                onPress={() => setShowFromLanguagePicker(true)}
                style={{
                  flex: 4,
                  borderWidth: 1,
                  borderColor: Colors.primary["500"],
                  borderRadius: 4,
                  padding: 8
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: "overpass-black",
                    color: Colors.primary["500"]
                  }}
                >
                  {options[selectedFromLanguage].title}
                </Text>
              </TouchableOpacity>
              <View style={{ flex: 1, paddingHorizontal: 8 }}>
                <Icon
                  size={24}
                  name="arrow-right"
                  type="material-community"
                  color={Colors.primary["500"]}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowToLanguagePicker(true)}
                style={{
                  flex: 4,
                  borderWidth: 1,
                  borderColor: Colors.primary["500"],
                  borderRadius: 4,
                  padding: 8
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: "overpass-black",
                    color: Colors.primary["500"]
                  }}
                >
                  {options[selectedToLanguage].title}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 5, paddingHorizontal: 10 }}>
            <View
              style={{
                padding: 8,
                borderColor: Colors.primary["200"],
                borderWidth: 2,
                borderBottomWidth: 2,
                borderRadius: 4,
                height: "100%",
                alignItems: "flex-start"
              }}
            >
              <Text
                style={{
                  color: Colors.primary["600"],
                  fontFamily: "overpass-black",
                  alignSelf: "flex-start",
                  fontSize: 28
                }}
              >
                {translatedText}
              </Text>
            </View>
            <TouchableOpacity
              onPress={playAudio}
              style={{
                position: "absolute",
                bottom: 8,
                right: 16
              }}
            >
              <Icon
                raised
                size={24}
                name="ear-hearing"
                type="material-community"
                color={Colors.primary["500"]}
              />
            </TouchableOpacity>
          </View>
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
                      fontFamily: "overpass-black",
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
                      fontFamily: "overpass-black",
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
      </View>
    </SafeAreaView>
  );
}

TranslateScreen.navigationOptions = {
  header: null
};
