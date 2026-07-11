import { getAssistantData } from '@/app/actions';
import { getLatestPlan } from '@/lib/repository';
import { AssistantForm } from '@/app/components/assistant-form';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AssistantPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const { sessionId, messages } = await getAssistantData();
  const plan = await getLatestPlan(user.id);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:grid-cols-[0.85fr_1.15fr]">
      <AssistantForm
        sessionId={sessionId}
        defaultCity={plan?.input.city}
        defaultLanguage={plan?.input.language}
      />
      <section className="card shadow-md">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--sky)] font-semibold border-b border-[color:var(--outline-variant)]/40 pb-4 mb-4">Conversation history</p>
        <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)] py-4 text-center">Ask the assistant about evacuation kits, flooded roads, medicines, or multilingual checklist help.</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="rounded-2xl border border-[color:var(--outline-variant)]/60 bg-[color:var(--surface-soft)]/45 p-4 transition hover:bg-[color:var(--surface-soft)]">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[color:var(--accent)] font-bold">{message.language} · {message.source}</p>
                  <span className="text-[9px] font-mono text-[color:var(--outline)]">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-[color:var(--foreground)]">Q: {message.prompt}</p>
                <p className="mt-3 text-xs leading-5 text-[color:var(--muted)] whitespace-pre-wrap">{message.response}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
