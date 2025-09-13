"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, googleProvider, db } from "@/lib/firebase"

interface UserProfile {
  uid: string
  email: string
  displayName: string
  role?: "doctor" | "patient"
  clinicName?: string
  clinicAddress?: string
  phoneNumber?: string
  specialization?: string
  dateOfBirth?: string
  gender?: string
  emergencyContact?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile)
        } else {
          // Create basic profile for new user
          const basicProfile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
          }
          await setDoc(doc(db, "users", user.uid), basicProfile)
          setUserProfile(basicProfile)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const updateUserProfile = async (profileUpdates: Partial<UserProfile>) => {
    if (!user) return

    try {
      const updatedProfile = { ...userProfile, ...profileUpdates }
      await setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true })
      setUserProfile(updatedProfile as UserProfile)
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    logout,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
