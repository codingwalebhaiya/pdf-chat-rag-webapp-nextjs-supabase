'use server'

import { signinSchema, signupSchema } from '@/lib/validations/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServer } from '@/lib/supabase/server'
import { db } from "@/lib/db"
import { eq } from "drizzle-orm";
import { profiles } from '@/lib/db/schema'


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
        success:true
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


// NOTE :  revalidatePath allows you to purge cached data on-demand for a specific path. It is primarily used within Server Actions or Route Handlers to update static pages or components immediately after a data mutation occurs (like submitting a form or fixing a typo)

//import { revalidatePath } from 'next/cache'
//revalidatePath(path: string, type ?: 'page' | 'layout')
