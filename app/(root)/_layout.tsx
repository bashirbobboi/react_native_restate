import { useGlobalContext } from "@/lib/global-provider";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, Slot } from "expo-router";

export default function AppLayout() {
    const { isLoggedIn, loading } = useGlobalContext();

    if(loading) {
        return (
            <SafeAreaView className="bg-white h-full flex items-center justify-center">
                <ActivityIndicator className="text-primary-300" size="large" />
            </SafeAreaView>
        )
    }

    if(!isLoggedIn) {
        return <Redirect href="/sign-in" />
    }

    return <Slot />
}