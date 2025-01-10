import { useEffect } from "react";
import { useRouter } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";


export default function Index() {
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/home"); // falls eingeloggt zum home screen
      } else {
        router.replace("/login"); // sonst zum login screen
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}


