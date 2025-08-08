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
  iconEnd,
  className,
  error,
  ...props
}: InputFieldProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full">
          <View className="flex flex-row gap-2">
            <Text className={cn(`text-base mb-3`, labelStyle)}>
              {label}
              {
                required && (
                  <Text>(obrigatório)</Text>
                )
              }
            </Text>
          </View>

          <View
            className={cn(`w-80 px-4 flex flex-row justify-start shadow-xl text-end relative bg-white rounded-full border ${error ? 'border-red-500' : 'border-primary'} focus:border-primary-500`, containerStyle)}
          >
            <View className="mt-4">
              {icon && !iconEnd && icon}
            </View>
            <TextInput
              className={cn('rounded-full py-4 px-0 text-[15px] flex-1 text-justify', inputStyle)}
              secureTextEntry={secureTextEntry} 
              {...props}
            />
            <View className="mt-4">
              {icon && iconEnd && icon}
            </View>
          </View>
          {error && (
            <Text className="text-red-500 text-sm mt-1 ml-4">{error}</Text>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;