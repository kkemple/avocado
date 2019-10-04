import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

export default () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardVisibleListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardHiddenListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardVisibleListener.remove();
      keyboardHiddenListener.remove();
    };
  }, [keyboardVisible, setKeyboardVisible]);

  return [keyboardVisible];
};
