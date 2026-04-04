import {
  createContext,
  useEffect,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { clearAuthToken, readAuthToken, saveAuthToken } from "@/services/token-storage";
import { requestJson } from "@/services/backend";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  profileCompleted: boolean;
};

export type UserProfile = {
  fullName: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  goal: string;
};

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  profileCompleted: boolean;
  user: AuthUser | null;
  login: (input: { email: string; password: string }) => Promise<{ profileCompleted: boolean }>;
  logout: () => Promise<void>;
  saveProfile: (input: UserProfile) => Promise<void>;
  signup: (input: { email: string; name: string; password: string }) => Promise<{ profileCompleted: boolean }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);  

type BackendAuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  profileCompleted: boolean;
};

type BackendProfile = UserProfile & {
  userId: string;
  createdAt?: string;
  updatedAt?: string;
};

type AuthResponse = {
  token: string;
  user: BackendAuthUser;
};

type MeResponse = {
  user: BackendAuthUser;
};

type ProfileResponse = {
  profile: BackendProfile | null;
};

function toAuthUser(user: BackendAuthUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    profileCompleted: user.profileCompleted,
  };
}

function toProfile(profile: BackendProfile | null): UserProfile | null {
  if (!profile) {
    return null;
  }

  return {
    fullName: profile.fullName,
    age: profile.age,
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
    goal: profile.goal,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const storedToken = await readAuthToken();

        if (!storedToken) {
          return;
        }

        const authResponse = await requestJson<MeResponse>("/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const profileResponse = await requestJson<ProfileResponse>("/profile/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!isMounted) {
          return;
        }

        setSessionToken(storedToken);
        setUser(toAuthUser(authResponse.user));
        setProfile(toProfile(profileResponse.profile));
      } catch {
        await clearAuthToken();

        if (!isMounted) {
          return;
        }

        setSessionToken(null);
        setUser(null);
        setProfile(null);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistSession = async (token: string, nextUser: BackendAuthUser) => {
    await saveAuthToken(token);
    setSessionToken(token);
    setUser(toAuthUser(nextUser));
  };

  const signup = async (input: { email: string; name: string; password: string }) => {
    const response = await requestJson<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(input),
    });

    await persistSession(response.token, response.user);
    setProfile(null);

    return { profileCompleted: false };
  };

  const login = async (input: { email: string; password: string }) => {
    const response = await requestJson<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });

    await persistSession(response.token, response.user);

    if (response.user.profileCompleted) {
      const profileResponse = await requestJson<ProfileResponse>("/profile/me", {
        headers: {
          Authorization: `Bearer ${response.token}`,
        },
      });

      setProfile(toProfile(profileResponse.profile));
    } else {
      setProfile(null);
    }

    return { profileCompleted: response.user.profileCompleted };
  };

  const saveProfile = async (input: UserProfile) => {
    const token = sessionToken || (await readAuthToken());

    if (!token) {
      throw new Error("You need to log in again before saving your profile.");
    }

    const response = await requestJson<ProfileResponse>("/profile/me", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    setProfile(toProfile(response.profile));

    if (user) {
      setUser({
        ...user,
        profileCompleted: true,
      });
    }
  };

  const logout = async () => {
    await clearAuthToken();
    setSessionToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isReady,
        isAuthenticated: Boolean(user),
        profile,
        profileCompleted: Boolean(profile),
        user,
        login,
        logout,
        saveProfile,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
