import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { User } from '../types';

const googleProvider = new GoogleAuthProvider();

/**
 * Sign up a new user with email and password
 */
export const signUpWithEmail = async (
    email: string,
    password: string,
    name: string
): Promise<User> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Update the user's display name
        await updateProfile(firebaseUser, {
            displayName: name
        });

        // Convert Firebase user to our User type
        return convertFirebaseUser(firebaseUser, name);
    } catch (error: any) {
        throw new Error(getAuthErrorMessage(error.code));
    }
};

/**
 * Sign in an existing user with email and password
 */
export const signInWithEmail = async (
    email: string,
    password: string
): Promise<User> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return convertFirebaseUser(userCredential.user);
    } catch (error: any) {
        throw new Error(getAuthErrorMessage(error.code));
    }
};

/**
 * Sign in with Google popup
 */
export const signInWithGoogle = async (): Promise<User> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return convertFirebaseUser(result.user);
    } catch (error: any) {
        throw new Error(getAuthErrorMessage(error.code));
    }
};

/**
 * Sign out the current user
 */
export const logOut = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error: any) {
        throw new Error('Failed to sign out. Please try again.');
    }
};

/**
 * Convert Firebase user to our User type
 */
const convertFirebaseUser = (firebaseUser: FirebaseUser, customName?: string): User => {
    const avatars = ['🎓', '🧠', '🚀', '🧪', '🔭', '🧬', '⚛️', '📐'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    return {
        id: firebaseUser.uid,
        name: customName || firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        avatar: randomAvatar,
        createdAt: firebaseUser.metadata.creationTime
            ? new Date(firebaseUser.metadata.creationTime).getTime()
            : Date.now(),
        subscriptionTier: 'free',
        quizUsage: {
            count: 0,
            resetAt: Date.now() + 7 * 24 * 60 * 60 * 1000
        }
    };
};

/**
 * Get user-friendly error messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'Email already registered.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/operation-not-allowed':
            return 'Operation not allowed.';
        case 'auth/weak-password':
            return 'Password too weak.';
        case 'auth/user-disabled':
            return 'Account has been disabled.';
        case 'auth/user-not-found':
            return 'Invalid credentials.';
        case 'auth/wrong-password':
            return 'Invalid credentials.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in popup was closed.';
        case 'auth/cancelled-popup-request':
            return 'Sign-in cancelled.';
        default:
            return 'Authentication failed. Please try again.';
    }
};
