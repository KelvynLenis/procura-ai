import { InputFieldProps } from "@/interfaces/InputField";
import { cn } from "@/utils/cn";
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
  labelStyle,
  containerStyle,
  required,
  inputStyle,
  iconStyle,
  className,
  ...props
}: InputFieldProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full">
          <View className="flex flex-row gap-2">
            {
              required && (
                <Text style={{ color: 'red' }}>*</Text>
              )
            }
            <Text className={cn(`text-lg mb-3`, labelStyle)}>
              {label}
            </Text>
          </View>

          <View
            className={cn(`w-80 px-4 flex flex-row justify-start shadow-xl items-center relative bg-white rounded-full border border-primary focus:border-primary-500`, containerStyle)}
          >
            {/* {icon && icon} */}
            <TextInput
              className={cn('rounded-full p-4 text-[15px] flex-1 text-justify', inputStyle)}
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