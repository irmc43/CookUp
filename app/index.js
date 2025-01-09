import { useEffect } from "react";
import { useRouter } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";


export default function Index() {
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/home"); //if logged in to homescreen
      } else {
        router.replace("/login"); //else to login screen
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}


