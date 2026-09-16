'use server'

import { signinSchema, signupSchema } from '@/lib/validations/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from "@/lib/db"
import { eq } from "drizzle-orm";
import { profiles } from '@/lib/db/schema'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'


//Cookies can only be modified in a Server Action or Route Handler. 
// Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options

export async function createServer() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options)
                        })
                    } catch (error) {
                        console.log("Error setting cookies", error);

                    }
                },
            }
        }
    )
}

export async function signinWithEmailPassword(formData: {
    email: string;
    password: string;
}) {
    const { email, password } = formData;

    // Validate input
    const validation = signinSchema.safeParse({ email, password })

    if (!validation.success) {
        return {
            error: validation.error.message,
            fields: { email, password },
        }
    }

    const supabase = await createServer();
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return {
            error: error.message

        }
    }

    revalidatePath("/", "layout");
    redirect("/");

}

export async function signupWithEmailPassword(formData: {
    name: string;
    email: string;
    password: string;
}) {
    const { name, email, password } = formData;
    // Validate input
    const validation = signupSchema.safeParse({ name, email, password })

    if (!validation.success) {
        return {
            error: validation.error.message,
            fields: { name, email, password },
        }
    }

    const supabase = await createServer();
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name
            }
        }

    })

    if (error) {
        return {
            error: error.message,
        }
    }

    revalidatePath("/", "layout");
    redirect("/signin");
}

export async function logout() {
    const supabase = await createServer();
    const { error } = await supabase.auth.signOut();
    if (error) {
        return {
            error: error.message,
        }
    }

    revalidatePath("/", "layout");
    return {
        success: true
    }
}


export async function userProfile() {
    const supabase = await createServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null
    }

    try {
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, user.id)
        });

        return profile;
    } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
}