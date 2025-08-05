
import 'react-native-get-random-values'
import { images } from "@/contants/images";
import { useRouter } from "expo-router";
import { Image, ImageBackground, ScrollView, Text, View } from "react-native";
import Button from '../components/Button';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: '100%', paddingBottom: 0 }} >
      <View className="px-4 bg-primary shadow-lg">
        <Image source={images.headerLogo} className="h-20"/>
      </View>

      <ImageBackground
        source={images.landingBg}
        className="flex-1 flex-row pr-2 py-7 justify-end bg-primary"
      >
        {/* <View className="w-40">
          <Image source={images.landingBg} style={{ width: '220%', height: '100%', left: 0, top:-18 }} />
        </View> */}
        
        <View className="flex w-80 gap-2 px-3">
          <Text className="text-white font-bold text-xl text-right leading-9">
            Perdeu ou teve seu celular roubado?
            O Procura.Aí pode te ajudar!
          </Text>

          <Text className="text-right text-white w-full self-end font-medium">
            Cadastre seus dispositivos e, se algo acontecer, acione as autoridades de forma rápida e segura. 
            Com ajuda da tecnologia, você aumenta as chances de recuperar seu aparelho e ainda contribui 
            para combater o mercado ilegal. Proteja-se agora e fique um passo à frente
          </Text>

          <Button variant="blue" className=" self-end" onPress={() => router.push('/auth/login')}>
            Entrar
          </Button>
        </View>
      </ImageBackground>

      <View className="flex-1 gap-5 items-center px-5 mt-10">
        <View className="flex flex-col items-center gap-2">
          <Text className="text-primary font-bold text-xl text-center">Veja como é fácil se proteger</Text>
          <Image source={images.circlesLine} className="self-center" />
        </View>

        <View className="flex flex-col gap-2 self-start w-full">
          <View className="self-start flex flex-row items-center gap-2">
            <Text className="bg-primary text-white rounded-full w-9 h-9 flex items-center justify-center text-center text-3xl">1</Text>
            <Text className="font-bold text-xl text-primary">Crie uma conta</Text>
          </View>
            <View className="bg-[#B6D7FC] w-full py-6 px-3 rounded-[18px] flex flex-row gap-10 justify-center items-center">
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
            <View className="bg-[#C5F4F3]  w-full py-6 px-3 rounded-[18px] flex flex-row gap-10 justify-center items-center">
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
            <View className="bg-[#F2CDC6] w-full py-6 px-3 rounded-[18px] flex flex-row gap-10 justify-center items-center">
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

            <View className="bg-[rgba(245,223,22,0.3)] w-full py-6 px-3 rounded-[18px] flex flex-row gap-10 justify-center items-center">
              <Image source={images.step4} />
              <Text className="w-3/5 font-medium text-lg">
                Agora seu dispositivo tem mais chances de ser recuperado  
              </Text>
            </View>
        </View>

        <Button onPress={() => router.push('/auth/sign-up')} variant="blue" className="self-center">
          Cadastre-se
        </Button>


      </View>

      <Text className='max-w-96 w-full text-lg font-medium self-center text-center mt-5'>
        Faça o download nas principais lojas de aplicativos
      </Text>

      <View className='relative h-56'>
        <Image source={images.line2} className="self-center absolute w-full -bottom-52 right-0" />
      </View>
      <ImageBackground source={images.footer} className="w-full h-56 flex flex-col justify-end mt-5 py-10 px-4">
        <View className="flex flex-row justify-end -mb-8">
          <Text className="text-zinc-400">Versão 0.0.8</Text>
        </View>
      </ImageBackground>
    </ScrollView>
  );
}