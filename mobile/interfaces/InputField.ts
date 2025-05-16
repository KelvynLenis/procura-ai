import { TextInputProps } from "react-native";

export interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  labelStyle?: string;
  required?: boolean;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
}
