'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Content block types ───────────────────────────────────────

interface BaseBlock {
  step: number
  type: 'step' | 'decision' | 'milestone'
  title: string
  body: string
  phase?: string
  tip?: string
  check?: string
}

interface StepBlock extends BaseBlock {
  type: 'step'
}

interface DecisionOption {
  label: string
  consequence: string
  next_step: number   // which step index to jump to when this option is chosen
}

interface DecisionBlock extends BaseBlock {
  type: 'decision'
  options: DecisionOption[]
}

interface MilestoneBlock extends BaseBlock {
  type: 'milestone'
  check?: string
  rejoin_step?: number  // optional: where branched paths converge
}

type Block = StepBlock | DecisionBlock | MilestoneBlock

// ── Branch history entry ──────────────────────────────────────
interface BranchChoice {
  at_step: number
  option_index: number
  option_label: string
}

interface Props {
  guide: any
  existingSave: any
  userId: string | null
}

export default function GuideReader({ guide, existingSave, userId }: Props) {
  const steps = guide.content_blocks as Block[]
  const totalSteps = steps.length

  // Restore from save — including branch history
  const savedState = existingSave?.completed_steps
    ? JSON.parse(typeof existingSave.completed_steps === 'string'
        ? existingSave.completed_steps
        : JSON.stringify(existingSave.completed_steps))
    : null

  const [currentStep, setCurrentStep] = useState<number>(
    existingSave?.current_step ?? 0
  )
  const [completed, setCompleted] = useState<Set<number>>(
    new Set(savedState?.completed ?? [])
  )
  const [branchHistory, setBranchHistory] = useState<BranchChoice[]>(
    savedState?.branches ?? []
  )
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveId, setSaveId] = useState<string | null>(existingSave?.id ?? null)

  const step = steps[currentStep]
  const completedCount = completed.size
  const progress = Math.round((completedCount / totalSteps) * 100)

  // ── Persist to Supabase ───────────────────────────────────────
  const persist = useCallback(async (
    stepIndex: number,
    completedSet: Set<number>,
    branches: BranchChoice[]
  ) => {
    if (!userId) return
    setSaving(true)
    const supabase = createClient()

    const payload = {
      user_id:      userId,
      map_id:       guide.map_id,
      guide_id:     guide.id,
      save_label:   `${(guide.maps as any)?.name ?? 'Unknown'} · ${guide.title}`,
      current_step: stepIndex,
      total_steps:  totalSteps,
      phase:        steps[stepIndex]?.phase ?? null,
      // Store both completed steps AND branch choices in completed_steps JSONB
      completed_steps: { completed: [...completedSet], branches },
      last_played:  new Date().toISOString(),
    }

    if (saveId) {
      await supabase.from('user_saves').update(payload).eq('id', saveId)
    } else {
      const { data } = await supabase
        .from('user_saves').insert(payload).select('id').single()
      if (data) setSaveId(data.id)
    }
    setSaving(false)
  }, [userId, guide, saveId, steps, totalSteps])

  // ── Navigation ────────────────────────────────────────────────

  const goToStep = (index: number) => {
    setCurrentStep(index)
    setSelectedOption(null)
    persist(index, completed, branchHistory)
  }

  const markComplete = () => {
    const block = steps[currentStep]
    const nextCompleted = new Set(completed)
    nextCompleted.add(currentStep)

    let nextStep: number

    if (block.type === 'decision' && selectedOption !== null) {
      // Follow the branch
      const chosen = (block as DecisionBlock).options[selectedOption]
      nextStep = chosen.next_step

      const newBranch: BranchChoice = {
        at_step:      currentStep,
        option_index: selectedOption,
        option_label: chosen.label,
      }
      const newHistory = [...branchHistory, newBranch]
      setBranchHistory(newHistory)
      setCompleted(nextCompleted)
      setSelectedOption(null)
      setCurrentStep(nextStep)
      persist(nextStep, nextCompleted, newHistory)
    } else {
      // Linear — just go to next step
      nextStep = Math.min(currentStep + 1, totalSteps - 1)
      setCompleted(nextCompleted)
      setSelectedOption(null)
      setCurrentStep(nextStep)
      persist(nextStep, nextCompleted, branchHistory)
    }
  }

  // ── Which steps are "reachable" given branch choices ─────────
  // Steps that were branched past are grayed out in the sidebar
  const getReachableSteps = (): Set<number> => {
    const reachable = new Set<number>()
    let cursor = 0
    const visited = new Set<number>()

    while (cursor < totalSteps && !visited.has(cursor)) {
      visited.add(cursor)
      reachable.add(cursor)
      const block = steps[cursor]

      if (block.type === 'decision') {
        // Find if user made a choice at this step
        const choice = branchHistory.find(b => b.at_step === cursor)
        if (choice) {
          const opt = (block as DecisionBlock).options[choice.option_index]
          cursor = opt.next_step
        } else {
          // Not yet decided — show all options' steps as reachable
          ;(block as DecisionBlock).options.forEach(opt => reachable.add(opt.next_step))
          cursor++
        }
      } else {
        cursor++
      }
    }
    return reachable
  }

  const reachable = getReachableSteps()

  // ── Sidebar grouping ──────────────────────────────────────────
  const phases = steps.reduce<Record<string, Block[]>>((acc, s) => {
    const phase = s.phase ?? 'Guide'
    if (!acc[phase]) acc[phase] = []
    acc[phase].push(s)
    return acc
  }, {})

  const isLastStep = currentStep === totalSteps - 1
  const isCurrentCompleted = completed.has(currentStep)
  const isDecision = step?.type === 'decision'
  const canProceed = !isDecision || selectedOption !== null

  // Find the choice made at the current step (if revisiting a decision)
  const previousChoice = step?.type === 'decision'
    ? branchHistory.find(b => b.at_step === currentStep)
    : null

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: '260px', flexShrink: 0,
        borderRight: '1px solid var(--border)',
        padding: '1.5rem 0',
        position: 'sticky', top: '56px',
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
        background: 'var(--surface-1)',
      }}>
        {/* Progress */}
        <div style={{ padding: '0 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div style={{ height: '4px', background: 'var(--surface-3)', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--field)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {completedCount} of {totalSteps} steps done
          </div>
        </div>

        {/* Branch history summary */}
        {branchHistory.length > 0 && (
          <div style={{ margin: '0 1rem 1.25rem', padding: '0.6rem 0.75rem', background: 'rgba(59,123,191,0.08)', border: '1px solid rgba(59,123,191,0.2)', borderRadius: '7px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--sky)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Your path</div>
            {branchHistory.map((b, i) => (
              <div key={i} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>
                → {b.option_label}
              </div>
            ))}
          </div>
        )}

        {/* Phase groups */}
        {Object.entries(phases).map(([phase, phaseSteps]) => (
          <div key={phase} style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 1.25rem', marginBottom: '0.35rem' }}>
              {phase}
            </div>
            {phaseSteps.map(s => {
              const idx = steps.indexOf(s)
              const isActive  = idx === currentStep
              const isDone    = completed.has(idx)
              const isSkipped = !reachable.has(idx)

              return (
                <button
                  key={idx}
                  onClick={() => !isSkipped && goToStep(idx)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '0.45rem 1.25rem 0.45rem 1rem',
                    background: isActive ? 'rgba(74,124,63,0.15)' : 'transparent',
                    border: 'none',
                    borderLeft: `3px solid ${isActive ? 'var(--field)' : 'transparent'}`,
                    cursor: isSkipped ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    opacity: isSkipped ? 0.3 : 1,
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700,
                    background: isDone
                      ? s.type === 'milestone' ? 'var(--harvest)' : 'var(--field)'
                      : isActive ? 'rgba(74,124,63,0.3)' : 'var(--surface-3)',
                    color: isDone ? 'white' : isActive ? 'var(--field)' : 'var(--text-muted)',
                  }}>
                    {s.type === 'milestone' ? '★' : isDone ? '✓' : idx + 1}
                  </div>
                  <span style={{
                    fontSize: '0.8rem', lineHeight: 1.3,
                    color: isActive ? 'var(--text-primary)' : isDone ? 'var(--text-secondary)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 400,
                  }}>
                    {s.title}
                    {s.type === 'decision' && (
                      <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--sky)', marginTop: '1px' }}>
                        {branchHistory.find(b => b.at_step === idx)
                          ? `→ ${branchHistory.find(b => b.at_step === idx)!.option_label.slice(0, 22)}…`
                          : 'Decision point'}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '680px' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a href="/guides" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Guides</a>
          <span>›</span>
          <span style={{ color: 'var(--text-secondary)' }}>{guide.title}</span>
        </div>

        {/* Phase label */}
        {step?.phase && (
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--field)', marginBottom: '0.5rem' }}>
            {step.phase}
          </div>
        )}

        {/* Step number + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700,
            background: step?.type === 'milestone' ? 'var(--harvest)' : 'var(--field)',
            color: 'white',
          }}>
            {step?.type === 'milestone' ? '★' : currentStep + 1}
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
            {step?.title}
          </h1>
        </div>

        {/* Type badges */}
        {step?.type === 'milestone' && (
          <div style={{ display: 'inline-flex', padding: '3px 10px', background: 'rgba(200,137,42,0.15)', color: 'var(--harvest)', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Milestone checkpoint
          </div>
        )}
        {step?.type === 'decision' && (
          <div style={{ display: 'inline-flex', padding: '3px 10px', background: 'rgba(59,123,191,0.15)', color: 'var(--sky)', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            {previousChoice ? `You chose: ${previousChoice.option_label}` : 'Decision point — choose your path'}
          </div>
        )}

        {/* Body */}
        <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {step?.body}
        </p>

        {/* Decision options */}
        {step?.type === 'decision' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {(step as DecisionBlock).options.map((opt, i) => {
              const isPreviousChoice = previousChoice?.option_index === i
              return (
                <button
                  key={i}
                  onClick={() => !previousChoice && setSelectedOption(i)}
                  style={{
                    textAlign: 'left', padding: '1rem 1.25rem',
                    background: (selectedOption === i || isPreviousChoice)
                      ? 'rgba(74,124,63,0.12)' : 'var(--surface-2)',
                    border: `1px solid ${(selectedOption === i || isPreviousChoice)
                      ? 'var(--field)' : 'var(--border)'}`,
                    borderRadius: '10px',
                    cursor: previousChoice ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                    opacity: previousChoice && !isPreviousChoice ? 0.4 : 1,
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {opt.label}
                    {isPreviousChoice && <span style={{ fontSize: '0.7rem', color: 'var(--field)', background: 'rgba(74,124,63,0.15)', padding: '1px 6px', borderRadius: '4px' }}>your choice</span>}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {opt.consequence}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Tip box */}
        {step?.tip && (
          <div style={{ padding: '0.875rem 1.125rem', background: 'rgba(74,124,63,0.08)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>💡</span>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {step.tip}
            </p>
          </div>
        )}

        {/* Milestone checklist */}
        {step?.type === 'milestone' && step.check && (
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(200,137,42,0.08)', border: '1px solid rgba(200,137,42,0.2)', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--harvest)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Before continuing, check:
            </div>
            {step.check.split('·').map((item: string, i: number) => (
              <div key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '0.2rem 0', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--harvest)' }}>✓</span>
                {item.trim()}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          {currentStep > 0 && (
            <button
              onClick={() => goToStep(currentStep - 1)}
              style={{ padding: '0.625rem 1.25rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ← Previous
            </button>
          )}

          {!isCurrentCompleted && (
            <button
              onClick={markComplete}
              disabled={!canProceed}
              style={{
                padding: '0.625rem 1.5rem',
                background: isLastStep ? 'var(--harvest)' : 'var(--field)',
                color: 'white', border: 'none', borderRadius: '8px',
                cursor: canProceed ? 'pointer' : 'not-allowed',
                fontSize: '0.9rem', fontWeight: 600,
                opacity: canProceed ? 1 : 0.5,
                transition: 'opacity 0.15s',
              }}
            >
              {isDecision && selectedOption !== null
                ? `Take this path →`
                : isLastStep ? '★ Complete guide' : 'Mark complete & continue →'
              }
            </button>
          )}

          {isCurrentCompleted && !isLastStep && (
            <button
              onClick={() => goToStep(currentStep + 1)}
              style={{ padding: '0.625rem 1.5rem', background: 'var(--field)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
            >
              Next step →
            </button>
          )}

          {saving && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Saving...</span>}
          {!userId && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <a href="/auth/login" style={{ color: 'var(--field)', textDecoration: 'none' }}>Sign in</a> to save progress
            </span>
          )}
        </div>

      </main>
    </div>
  )
}
