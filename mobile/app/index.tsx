
import { images } from "@/contants/images";
import { useRouter } from "expo-router";
import { Image, ImageBackground, ScrollView, Text, View } from "react-native";
import Button from '../components/Button';

export default function Index() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%', paddingBottom: 20 }} >
      <View className="px-5 bg-white shadow-lg">
        <Image source={images.headerLogo} className="" />
      </View>
      <ImageBackground
        source={images.hero}
        className="flex-1 flex-row bg-primary pr-2 pt-5"
      >
        <View className="w-1/2">
        <Image source={images.landing} style={{ width: '100%', height: '90%' }} />

        </View>
        
        <View className="flex w-1/2 gap-2">
          <Text className="text-primary font-bold text-2xl text-right leading-9">
            Perdeu ou teve seu celular roubado? 
            O{' '}
            <View className="bg-primary rounded-md p-1">
              <Text className="text-white font-bold">Procura.Aí</Text>
            </View> 
            {' '}pode te ajudar!
          </Text>

          <Text className="text-right w-52 self-end font-medium">
            Cadastre seus dispositivos e, se algo acontecer, acione as autoridades de forma rápida e segura. 
            Com ajuda da tecnologia, você aumenta as chances de recuperar seu aparelho e ainda contribui 
            para combater o mercado ilegal. Proteja-se agora e fique um passo à frente
          </Text>

          <Button variant="blue" className=" self-end" onPress={() => router.push('/auth/login')}>
            Entrar
          </Button>
        </View>
      </ImageBackground>

      <View className="flex-1 gap-5 items-center px-5">
        <View className="flex flex-col items-center gap-2">
          <Text className="text-primary font-bold text-xl text-center">Veja como é fácil se proteger</Text>
          <Image source={images.circlesLine} className="self-center" />
        </View>

        <View className="flex flex-col gap-2 self-start w-full">
          <View className="self-start flex flex-row items-center gap-2">
            <Text className="bg-primary text-white rounded-full w-9 h-9 flex items-center justify-center text-center text-3xl">1</Text>
            <Text className="font-bold text-xl text-primary">Crie uma conta</Text>
          </View>

          <View className="bg-[#7F96B8] w-full py-6 px-3 rounded-xl flex flex-row gap-10 justify-center items-center">
            <Image source={images.step1} />
            <Text className="w-3/5 font-medium text-lg">
              Cadastre-se no Procura.Aí informando alguns dados básicos
            </Text>
          </View>
        </View>

        <View className="flex flex-col gap-2 self-start w-full">
          <View className="self-start flex flex-row items-center gap-2">
            <Text className="bg-primary text-white rounded-full w-9 h-9 flex items-center justify-center text-center text-3xl">2</Text>
            <Text className="font-bold text-xl text-primary">Cadastre seus dispositivos</Text>
          </View>

          <View className="bg-[#EBD488] w-full py-6 px-3 rounded-xl flex flex-row gap-10 justify-center items-center">
            <Image source={images.step2} />
            <Text className="w-[60%] font-medium text-lg">
              Registre um ou mais dispositivos para mantê-los protegidos
            </Text>
          </View>
        </View>

        <View className="flex flex-col gap-2 self-start w-full">
          <View className="self-start flex flex-row items-center gap-2">
            <Text className="bg-primary text-white rounded-full w-9 h-9 flex items-center justify-center text-center text-3xl">3</Text>
            <Text className="font-bold text-xl text-primary">Crie um alerta</Text>
          </View>
          <View className="bg-[#E7A093] w-full py-6 px-3 rounded-xl flex flex-row gap-10 justify-center items-center">
            <Image source={images.step3} />
            <Text className="w-3/5 font-medium text-lg">
              Em caso de roubo, perda ou furto de algum dispositivo, crie um alerta 
            </Text>
          </View>
        </View>
        
        <View className="flex flex-col gap-2 self-start w-full">
          <View className="self-start flex flex-row items-center gap-2">
            <Text className="bg-primary text-white rounded-full w-9 h-9 flex items-center justify-center text-center text-3xl">4</Text>
            <Text className="font-bold text-xl text-primary">Autoridades são acionadas</Text>
          </View>
          <View className="bg-[#9BD6C1] w-full py-6 px-3 rounded-xl flex flex-row gap-10 justify-center items-center">
            <Image source={images.step4} />
            <Text className="w-3/5 font-medium text-lg">
              Agora seu dispositivo tem mais chances de ser recuperado  
            </Text>
          </View>
        </View>

        <Button variant="blue" className="self-center">
          Cadastre-se
        </Button>
      </View>
    </ScrollView>
  );
}