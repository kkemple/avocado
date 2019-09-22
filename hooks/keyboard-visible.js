import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export default () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardVisibleListener = Keyboard.addListener(
      "keyboardWillShow",
      () => setKeyboardVisible(true)
    );
    const keyboardHiddenListener = Keyboard.addListener(
      "keyboardWillHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardVisibleListener.remove();
      keyboardHiddenListener.remove();
    };
  }, [keyboardVisible, setKeyboardVisible]);

  return [keyboardVisible];
};
