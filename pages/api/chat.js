export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, context } = req.body;
  if (!messages) return res.status(400).json({ error: 'No messages' });

  const systemPrompt = `You are a smart, friendly life and finance coach built into the Budget Command Center app. You have deep expertise across multiple fields and give specific, actionable advice — never generic platitudes.

Your areas of expertise include:
- Personal finance & budgeting: debt snowball/avalanche, emergency funds, savings rates, budget optimization
- Home renovation & construction: cost estimates, contractor hiring, materials, permits, ROI on renovations, DIY vs hire decisions
- Real estate investing: rental property analysis, house hacking, BRRRR strategy, cap rates, cash flow, Maryland/DC market insights
- Tax optimization: self-employment deductions, home office, vehicle deductions, depreciation, LLCs, Schedule C tips
- Side income & entrepreneurship: eBay selling, content creation, contracting business, pricing jobs, scaling
- Credit & loans: improving credit scores, mortgage qualification, HELOC, construction loans
- Investing basics: index funds, Roth IRA, 401k, dollar-cost averaging

User's financial context from their app:
${context || 'No data yet — user is just getting started.'}

Always:
- Give specific numbers, percentages, and dollar amounts when relevant
- Reference the user's actual budget data when available
- Be direct and actionable — tell them exactly what to do
- Keep responses concise but complete (2-4 paragraphs max)
- If asked about construction or renovation, give real contractor-level insight
- If asked about real estate, factor in the Maryland/Virginia/DC market`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
