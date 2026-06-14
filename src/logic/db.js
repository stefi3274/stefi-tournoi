import { supabase } from '../supabase.js'
import { buildKnockoutRounds } from './bracket.js'

// ══════════════════════════════════════════
// TOURNAMENTS
// ══════════════════════════════════════════

export async function fetchTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createTournament(name, teamCount, playerCount) {
  const { data, error } = await supabase
    .from('tournaments')
    .insert({ name, team_count: teamCount, player_count: playerCount })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTournament(id) {
  const { error } = await supabase.from('tournaments').delete().eq('id', id)
  if (error) throw error
}

// ══════════════════════════════════════════
// FULL TOURNAMENT LOAD (groups + players + matches + standings)
// ══════════════════════════════════════════

export async function fetchFullTournament(tournamentId) {
  // 1. Tournoi
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', tournamentId)
    .single()
  if (tErr) throw tErr

  // 2. Groupes
  const { data: groups, error: gErr } = await supabase
    .from('groups')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('letter')
  if (gErr) throw gErr

  // 3. Pour chaque groupe : standings + matches
  const fullGroups = await Promise.all(groups.map(async g => {
    const [{ data: standings }, { data: matches }] = await Promise.all([
      supabase
        .from('group_players')
        .select('*, players(name, age)')
        .eq('group_id', g.id),
      supabase
        .from('group_matches')
        .select('*, home:home_player_id(id,name,age), away:away_player_id(id,name,age)')
        .eq('group_id', g.id)
    ])
    return {
      ...g,
      standings: (standings ?? []).map(s => ({
        ...s,
        name: s.players?.name,
        age: s.players?.age,
      })),
      matches: matches ?? [],
    }
  }))

  // 4. Matchs KO
  const { data: koMatches } = await supabase
    .from('ko_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('round_index')
    .order('match_index')

  // Regrouper les KO par round
  const koRounds = []
  ;(koMatches ?? []).forEach(m => {
    let round = koRounds.find(r => r.name === m.round_name)
    if (!round) { round = { name: m.round_name, round_index: m.round_index, matches: [] }; koRounds.push(round) }
    round.matches.push(m)
  })
  koRounds.sort((a, b) => a.round_index - b.round_index)

  return { ...tournament, groups: fullGroups, knockout: { rounds: koRounds } }
}

// ══════════════════════════════════════════
// CREATE FULL TOURNAMENT (après tirage)
// ══════════════════════════════════════════

export async function saveTournamentWithGroups(name, teamCount, drawGroups, allPlayers) {
  // 1. Créer le tournoi
  const tournament = await createTournament(name, teamCount, allPlayers.length)

  // 2. Insérer les joueurs
  const { data: insertedPlayers, error: pErr } = await supabase
    .from('players')
    .insert(allPlayers.map(p => ({ tournament_id: tournament.id, name: p.name, age: p.age })))
    .select()
  if (pErr) throw pErr

  // Map nom → id
  const playerMap = {}
  insertedPlayers.forEach(p => { playerMap[p.name + '_' + p.age] = p.id })

  // 3. Créer les groupes + group_players + matches
  for (const g of drawGroups) {
    const { data: group, error: grErr } = await supabase
      .from('groups')
      .insert({ tournament_id: tournament.id, letter: g.letter })
      .select()
      .single()
    if (grErr) throw grErr

    const gPlayers = g.players.map(p => ({
      ...p,
      dbId: playerMap[p.name + '_' + p.age],
    }))

    // group_players (standings init à 0)
    await supabase.from('group_players').insert(
      gPlayers.map(p => ({ group_id: group.id, player_id: p.dbId }))
    )

    // group_matches : round-robin
    const matchInserts = []
    for (let i = 0; i < gPlayers.length; i++) {
      for (let j = i + 1; j < gPlayers.length; j++) {
        matchInserts.push({
          group_id: group.id,
          home_player_id: gPlayers[i].dbId,
          away_player_id: gPlayers[j].dbId,
        })
      }
    }
    await supabase.from('group_matches').insert(matchInserts)
  }

  // 4. Créer le bracket KO vide
  const rounds = buildKnockoutRounds(teamCount)
  const koInserts = []
  rounds.forEach(r => {
    r.matches.forEach(m => {
      koInserts.push({ tournament_id: tournament.id, ...m })
    })
  })
  await supabase.from('ko_matches').insert(koInserts)

  return tournament.id
}

// ══════════════════════════════════════════
// SCORES
// ══════════════════════════════════════════

export async function saveGroupScore(matchId, groupId, homeId, sh, awayId, sa, wasPlayed, oldSh, oldSa, standings) {
  // Mettre à jour le match
  const { error: mErr } = await supabase
    .from('group_matches')
    .update({ score_home: sh, score_away: sa, played: true })
    .eq('id', matchId)
  if (mErr) throw mErr

  // Recalculer standings pour les 2 joueurs
  const { sortStandings } = await import('./standings.js')
  // On récupère les standings à jour et on les met à jour en DB
  for (const entry of standings) {
    const { error } = await supabase
      .from('group_players')
      .update({
        pts: entry.pts, j: entry.j, g: entry.g, n: entry.n,
        d: entry.d, bp: entry.bp, bc: entry.bc, diff: entry.diff
      })
      .eq('group_id', groupId)
      .eq('player_id', entry.player_id)
    if (error) throw error
  }
}

export async function saveKOScore(matchId, fields) {
  const { error } = await supabase
    .from('ko_matches')
    .update(fields)
    .eq('id', matchId)
  if (error) throw error
}

// ══════════════════════════════════════════
// REALTIME SUBSCRIPTIONS
// ══════════════════════════════════════════

export function subscribeToTournament(tournamentId, onGroupMatch, onKOMatch, onStandings) {
  const channel = supabase.channel('tournament-' + tournamentId)

  channel
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'group_matches',
    }, payload => onGroupMatch(payload))
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'ko_matches',
      filter: `tournament_id=eq.${tournamentId}`,
    }, payload => onKOMatch(payload))
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'group_players',
    }, payload => onStandings(payload))
    .subscribe()

  return channel
}

export function unsubscribe(channel) {
  if (channel) supabase.removeChannel(channel)
}
