'use server'
import {UTApi} from 'uploadthing/server'
 const utapi = new UTApi();
export async function deleteFile(fileKey: string): Promise<void> {
    if(!fileKey) {
        throw new Error('File key is required');
    }
    try {
        await utapi.deleteFiles(fileKey);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('Failed to delete file');
    }
}