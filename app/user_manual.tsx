import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Header from "@/components/Header";
import Accordion from "@/components/Accordion";
import { ThemeContext } from "@/context/ThemeContext";

export default function UserManual() {
    const user_manual = [
        {
            title: "Welcome to SleepSpec!",
            description:
                "SleepSpec is a mobile application that helps you check for signs of sleep deprivation based on your voice. It's easy to use and only takes a few minutes to process.",
            image: "",
            isOpened: true,
        },

        {
            title: "How to start?",
            description:
                "When you open the app, you will see two main buttons:",
            list: {
                type: "bullet",
                items: [
                    {
                        title: "Start Test",
                        description:
                            "Choose the speech script language you want to use in recording.",
                    },
                    {
                        title: "Microphone",
                        description:
                            "Takes you to the Recording interface to start voice recording.",
                    },
                ],
            },
            image: require("./../assets/images/home_guide.png"),
            isOpened: false,
        },
        {
            title: "Speech Script Language Selection",
            description:
                "Pick the language you are most comfortable speaking. The sentence you need to read will appear based on this choice. On this page, you can choose between:",
            list: {
                type: "bullet",
                items: [
                    {
                        title: "English",
                        description: "English speech script",
                    },
                    {
                        title: "Filipino",
                        description: "Filipino speech script",
                    },
                ],
            },
            image: require("./../assets/images/speech_script_language_guide.png"),
            isOpened: false,
        },
        {
            title: "Recording Guide",
            description:
                "The app will automatically process your recording and check for signs of sleep deprivation.",
            list: {
                type: "bullet",
                items: [
                    {
                        title: "Change Language",
                        description:
                            "If you want to switch to another language before recording, you can still do it here.",
                    },
                    {
                        title: "Read the Sentence",
                        description:
                            "The sentence you need to read will appear based on the language you selected.",
                    },
                    {
                        title: "Microphone Button Controls",
                        description:
                            "Tap once to start recording, tap again to pause the recordin, and press and hold to stop recording and analyze your voice.",
                    },
                ],
            },
            image: require("./../assets/images/recording_guide.png"),
            isOpened: false,
        },
        {
            title: "Tips for Best Results",
            description:
                "When you open the app, you will see two main buttons:",
            list: {
                type: "bullet",
                items: [
                    {
                        description: "Use the app in a quiet place.",
                    },
                    {
                        description:
                            "Speak naturally—no need to rush or change your voice.",
                    },
                    {
                        description:
                            "Follow the instructions on screen for a smooth experience.",
                    },
                ],
            },
            image: "",
            isOpened: false,
        },
        {
            title: "Need Help?",
            description:
                "If you're unsure what to do, you can always return to the User Manual from the Home Page and Menu Bar.",
            list: {
                type: "bullet",
                items: [
                    {
                        title: "Email us",
                        description: "sleepspec@gmail.com",
                    },
                ],
            },
            image: "",
            isOpened: false,
        },
    ];

    const { currentTheme } = useContext(ThemeContext);
    const isDark = currentTheme === "dark";
    const textClass = isDark ? "text-secondary" : "text-darkBg";
    const bgClass = isDark ? "bg-darkBg" : "bg-lightBg";
    const borderColor = isDark ? "#006FFF" : "#585858";
    const topStopColor = isDark ? "#006FFF" : "#01000F";
    const bottomStopColor = isDark ? "#7800D3" : "#01000F";
    const TabBackgroundColor = isDark ? "#01000F" : "#FFF";
    const headerColor = isDark ? "bg-arsenic" : "bg-grayLayer";
    const modalColor = isDark ? "bg-darkLayer" : "bg-white";

    const [fontsLoaded] = useFonts({
        "Poppins-Regular": require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
        "Poppins-Bold": require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
        "PublicSans-Regular": require("../assets/fonts/Public_Sans/static/PublicSans-Regular.ttf"),
        "PublicSans-Bold": require("../assets/fonts/Public_Sans/static/PublicSans-Bold.ttf"),
    });
    useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;
    return (
        <SafeAreaView className={bgClass + " text-secondary flex-1"}>
            <Header title={"User Manual"} back={true} menu={true} />
            <ScrollView
                className="flex px-6 mt-5"
                contentContainerStyle={{
                    flexGrow: 1,
                    gap: 30,
                }}
            >
                <View className="justify-start items-start text-start gap-2">
                    <Text className={textClass + " font-poppinsBold text-2xl"}>
                        SleepSpec User Manual
                    </Text>
                    <Text
                        className={
                            textClass + " font-publicsans text-sm opacity-80"
                        }
                    >
                        Your Personal Voice-Based Sleep Deprivation Checker
                    </Text>
                </View>
                <View className="gap-5">
                    {user_manual.map((manual, index) => (
                        <Accordion
                            key={index.toString()}
                            title={manual.title}
                            description={manual.description}
                            image={manual.image}
                            isOpened={manual.isOpened}
                            {...(manual.list && { list: manual.list })}
                        ></Accordion>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({});
