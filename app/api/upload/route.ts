import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

// CSV upload endpoint - parses CSV and returns transactions
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are supported' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(Boolean);
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const transactions = lines.slice(1).map((line, i) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => { obj[h] = values[idx] ?? ''; });
      return {
        id: `upload-${i}`,
        date: obj['date'] ?? '',
        merchant: obj['merchant'] ?? obj['description'] ?? obj['payee'] ?? 'Unknown',
        amount: parseFloat(obj['amount'] ?? '0') || 0,
        category: obj['category'] ?? 'Uncategorized',
      };
    }).filter(t => t.date && t.amount !== 0);

    return NextResponse.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}
