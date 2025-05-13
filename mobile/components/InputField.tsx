import { InputFieldProps } from "@/interfaces/InputField";
import {
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";


const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  className,
  ...props
}: InputFieldProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full">
          <Text className={`text-lg mb-3 ml-5`}>
            {label}
          </Text>

          <View
            className={`w-80 px-4 flex flex-row justify-start shadow-xl items-center relative bg-white rounded-full border border-primary focus:border-primary-500`}
          >
            {/* {icon && icon} */}
            <TextInput
              className={`rounded-full p-4 text-[15px] flex-1 text-left`}
              secureTextEntry={secureTextEntry} 
              {...props}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;