import {z} from 'zod'
export const createPostSchema=z.object({
content:z.string().min(8).max(5000)
})
