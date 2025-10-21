'use server'

import { cookies } from "next/headers"

export async function getTokenStatus() {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get('refreshToken')?.value;
    const accessToken = cookieStore.get('accessToken')?.value;
    return {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
    };
}