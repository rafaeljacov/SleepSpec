import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
    StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Audio } from "expo-av";
import { useClassStore, useLangStore } from "@/store/store";
import CustomRCPreset from "@/constants/rc_option";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/FontAwesome";
import axios from "axios";

import Header from "@/components/Header";
import LanguageSelected from "@/components/LanguageSelected";
import { CLASS, LANG } from "@/types/types";

const RecorderImage = require("@/assets/images/recording-button.png");

type Timer = {
    secs: number;
    mins: number;
};

interface RecordingState {
    timer: Timer;
    isRecording: boolean;
}

enum RecordAction {
    START,
    STOP,
    INCREMENT_TIMER,
}

enum UploadResult {
    IDLE,
    PENDING,
    READY,
    FAILED,
}

const recordReducer = (
    state: RecordingState,
    action: RecordAction,
): RecordingState => {
    switch (action) {
        case RecordAction.START:
            return { ...state, isRecording: true };

        case RecordAction.STOP:
            return {
                ...state,
                timer: { secs: 0, mins: 0 },
                isRecording: false,
            };

        case RecordAction.INCREMENT_TIMER:
            const {
                timer: { secs, mins },
            } = state;
            const newSecs = secs + 1;
            const newMins = mins + Math.floor(newSecs / 60);

            return {
                ...state,
                timer: {
                    secs: newSecs % 60,
                    mins: newMins,
                },
            };
    }
};

const initialRecordState: RecordingState = {
    timer: {
        secs: 0,
        mins: 0,
    },
    isRecording: false,
};

export default function Recording() {
    const [recordState, dispatch] = useReducer(
        recordReducer,
        initialRecordState,
    );
    const timerRef = useRef<NodeJS.Timeout>();
    const [recording, setRecording] = useState<Audio.Recording>();
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const { currentLang: lang } = useLangStore();
    const [upload, setUpload] = useState(UploadResult.IDLE);
    const { result, setResult } = useClassStore();

    useEffect(() => {
        // remove interval when component unmounts
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            return () => {
                // Cleanup when this page goes out of focus
                recordStop(false)
            }
        }, [recording])
    )

    async function recordStart() {
        if (recordState.isRecording) {
            return;
        }

        dispatch(RecordAction.START);
        const timerInterval = setInterval(() => {
            dispatch(RecordAction.INCREMENT_TIMER);
        }, 1000);

        timerRef.current = timerInterval;

        try {
            if (permissionResponse!.status !== "granted") {
                await requestPermission();
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } =
                await Audio.Recording.createAsync(CustomRCPreset);
            setRecording(recording);
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    }

    async function recordStop(upload: boolean) {
        if (!recordState.isRecording || !recording) {
            return;
        }

        dispatch(RecordAction.STOP);
        clearInterval(timerRef.current);

        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });

        // Skip upload when specified
        if (!upload) return;

        const uri = recording.getURI();
        const result = await uploadAudio(uri!);

        if (!result) {
            setUpload(UploadResult.FAILED);
            return;
        }

        console.log(result);
        setUpload(UploadResult.READY);

        setResult(CLASS.fromJSON(result));
    }

    return (
        <SafeAreaView className="bg-darkBg" style={{ flex: 1 }}>
            <Header title={"Recording"} back={true} menu={true} />
            <ScrollView className="flex gap-4 mt-10 px-6">
                <View className="gap-2">
                    <Text className="text-lg text-white font-medium">
                        Language
                    </Text>
                    <Link href="/select_language" className="w-28">
                        <LanguageSelected />
                    </Link>
                </View>
                <View className="py-6">
                    <ScrollView
                        className="max-h-[350px] pb-6 border-2 rounded-lg border-blue-800 p-4"
                        nestedScrollEnabled={true}
                    >
                        <Text className=" text-lg leading-6 text-secondary font-light text-ellipsis">
                            {LANG.getScript(lang)}
                        </Text>
                    </ScrollView>
                </View>

                <Text className="text-white mx-auto text-3xl">
                    {formatTime(recordState.timer)}
                </Text>
                <View className="flex justify-center items-center my-5">
                    <Pressable
                        onPress={() => {
                            if (recordState.isRecording) {
                                recordStop(true);
                                setUpload(UploadResult.PENDING);
                            } else {
                                recordStart();
                            }
                        }}
                    >
                        <LinearGradient
                            colors={["#006EFF", "#7800D3"]}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            className="justify-center items-center p-[2px]"
                            style={styles.linearGradientMicrophone}
                        >
                            <View className="w-40 h-40 flex justify-center items-center bg-[#01000F] rounded-full">
                                <Icon
                                    name="microphone"
                                    size={60}
                                    color={
                                        recordState.isRecording
                                            ? "#006fff"
                                            : "#FFF"
                                    }
                                />
                            </View>
                        </LinearGradient>
                    </Pressable>
                </View>

                <Text
                    className={`text-2xl font-medium mx-auto ${
                        recordState.isRecording
                            ? "text-primaryBlue"
                            : "text-white"
                    }`}
                >
                    {recordState.isRecording ? "Speak Now" : "Press to Record"}
                </Text>

                {result && ( // only show link when results are ready
                    <Link
                        href="/analysis"
                        className="text-secondary font-medium mt-12"
                    >
                        <Text className="text-right">View Results</Text>
                    </Link>
                )}
            </ScrollView>

            <ProcessOverlay state={upload} />
        </SafeAreaView>
    );
}

function ProcessOverlay({ state }: { state: UploadResult }) {
    const router = useRouter();

    useEffect(() => {
        if (state == UploadResult.READY) {
            router.push("/analysis");
        }
    }, [state, router]);

    // Do not render overlay
    if (state != UploadResult.PENDING) return;

    return (
        <View className="flex justify-center items-center pb-28 bg-darkBg absolute top-[90] w-full h-full">
            <View className="flex items-center gap-2">
                <Text className="text-primaryBlue text-2xl font-medium">
                    Pre - processing
                </Text>
                <Text className="text-secondary mb-8 text-lg">
                    Please wait for a moment...
                </Text>
                <ActivityIndicator size={70} color={"#006fff"} />
            </View>
        </View>
    );
}

async function uploadAudio(audioUri: string): Promise<{
    class: number;
    confidence_score: number;
} | void> {
    if (process.env.EXPO_PUBLIC_SERVER == "NO") {
        // return mock result
        return {
            class: 1,
            confidence_score: 0.56,
        };
    }

    const formData = new FormData();
    formData.append("audio", {
        uri: audioUri,
        name: "recording.m4a",
        type: "audio/m4a",
    } as any);

    const env = process.env.EXPO_PUBLIC_DEVICE;

    let api;
    if (env == "PHYSICAL") {
        api = process.env.EXPO_PUBLIC_API_URL;
    } else if (env == "EMU") {
        api = "http://10.0.2.2:5000";
    } else {
        console.error(
            "Please set EXPO_PUBLIC_DEVICE value (PHYSICAL / EMU) in .env file!",
        );
    }

    console.log(env, api);
    try {
        const response = await axios.post(`${api}/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        console.error("Upload failed", error);
    }
}

function formatTime({ secs, mins }: Timer): string {
    const formattedMinutes = String(mins).padStart(2, "0");
    const formattedSeconds = String(secs).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

const styles = StyleSheet.create({
    linearGradientMicrophone: {
        borderRadius: 100,
    },
});
