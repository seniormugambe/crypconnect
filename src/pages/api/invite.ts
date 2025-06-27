import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory store for demo (replace with DB for production)
const invites: Record<string, { inviter: string; createdAt: number }> = global.invites || (global.invites = {});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { inviter } = req.body;
    if (!inviter) return res.status(400).json({ error: 'Missing inviter' });
    const code = Math.random().toString(36).substring(2, 10);
    invites[code] = { inviter, createdAt: Date.now() };
    return res.status(200).json({ code });
  } else if (req.method === 'GET') {
    const { code } = req.query;
    if (typeof code !== 'string' || !invites[code]) {
      return res.status(404).json({ error: 'Invite not found' });
    }
    return res.status(200).json({ inviter: invites[code].inviter });
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 