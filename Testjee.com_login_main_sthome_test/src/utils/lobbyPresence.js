/**
 * Live "students actually in the lobby right now" tracking, via Supabase Realtime Presence.
 *
 * Distinct from `student_exam_sessions.status = 'not_started'` (which is set for every
 * enrolled student the moment the admin schedules the session, and only changes when they
 * click "Start Exam") — that DB status can't tell "never opened the link" apart from
 * "sitting in the lobby right now waiting." Presence is ephemeral, socket-based state Realtime
 * tracks in-memory: a client calls `.track()` while connected, and it's automatically removed
 * the instant their tab closes or the connection drops. No DB writes, no stale "still here"
 * bugs, and no dependency on Postgres replication being enabled (unlike the existing
 * `postgres_changes` subscription on this same channel).
 *
 * Reuses the exact channel name (`lobby-{sessionCode}`) ExamWaitingRoom.vue already opens for
 * its `postgres_changes` subscription — presence and postgres_changes can coexist on one
 * channel with no conflict.
 */
import { supabase } from '../lib/supabase'

/** Student side: call once the lobby channel is subscribed. */
export function trackLobbyPresence(channel, identity) {
  channel.track({ ...identity, joined_at: new Date().toISOString() })
}

/**
 * Admin side: subscribe to a session's lobby channel purely to observe presence (never
 * tracks anything itself, so the admin never counts as a "present student"). Calls
 * `onCountChange(count)` every time presence state changes. Returns the channel so the
 * caller can `supabase.removeChannel(channel)` on cleanup.
 */
export function watchLobbyPresence(sessionCode, onCountChange) {
  const channel = supabase.channel(`lobby-${sessionCode}`)
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    onCountChange(Object.keys(state).length)
  })
  channel.subscribe()
  return channel
}
