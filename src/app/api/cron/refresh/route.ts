// Vercel cron entrypoint — wired in vercel.json. Cron requests get a
// generated Authorization: Bearer <CRON_SECRET> header automatically
// when CRON_SECRET is set on the project.

export { GET } from '../../refresh/route';
