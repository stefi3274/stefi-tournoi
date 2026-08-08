import { supabase } from '../supabase.js'
import { buildKnockoutRounds } from './bracket.js'

// ── TOURNAMENTS ──
export async function fetchTournaments() {
  const { data, error } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createTournament(name, teamCount, playerCount, type = 'championnat') {
  const { data, error } = await supabase.from('tournaments')
    .insert({ name, team_count: teamCount, player_count: playerCount, type })
    .select().single()
  if (error) throw error
  return data
}

export async function deleteTournament(id) {
  const { error } = await supabase.from('tournaments').delete().eq('id', id)
  if (error) throw error
}

// ── FULL LOAD ──
export async function fetchFullTournament(id) {
  const { data: tournament, error: tErr } = await supabase.from('tournaments').select('*').eq('id', id).single()
  if (tErr) throw tErr

  // Groupes (seulement pour championnat)
  let fullGroups = []
  if (tournament.type !== 'coupe') {
    const { data: groups } = await supabase.from('groups').select('*').eq('tournament_id', id).order('letter')
    fullGroups = await Promise.all((groups ?? []).map(async g => {
      const [{ data: standings }, { data: matches }] = await Promise.all([
        supabase.from('group_players').select('*, players(name, age)').eq('group_id', g.id),
        supabase.from('group_matches').select('*, home:home_player_id(id,name,age), away:away_player_id(id,name,age)').eq('group_id', g.id)
      ])
      return {
        ...g,
        standings: (standings ?? []).map(s => ({ ...s, name: s.players?.name, age: s.players?.age })),
        matches: matches ?? [],
      }
    }))
  }

  // KO matches
  const { data: koMatches } = await supabase.from('ko_matches').select('*')
    .eq('tournament_id', id).order('round_index').order('match_index')

  const koRounds = []
  ;(koMatches ?? []).forEach(m => {
    let round = koRounds.find(r => r.name === m.round_name)
    if (!round) { round = { name: m.round_name, round_index: m.round_index, matches: [] }; koRounds.push(round) }
    round.matches.push(m)
  })
  koRounds.sort((a, b) => a.round_index - b.round_index)

  return { ...tournament, groups: fullGroups, knockout: { rounds: koRounds } }
}

// ── SAVE FULL TOURNAMENT ──
export async function saveTournamentWithGroups(name, teamCount, drawGroups, allPlayers, type = 'championnat') {
  const tournament = await createTournament(name, teamCount, allPlayers.length, type)

  // Insérer joueurs
  const { data: insertedPlayers, error: pErr } = await supabase.from('players')
    .insert(allPlayers.map(p => ({ tournament_id: tournament.id, name: p.name, age: p.age })))
    .select()
  if (pErr) throw pErr

  const playerMap = {}
  insertedPlayers.forEach(p => { playerMap[p.name + '_' + p.age] = p.id })

  if (type === 'championnat') {
    // Groupes + matchs de poule
    for (const g of drawGroups) {
      const { data: group } = await supabase.from('groups')
        .insert({ tournament_id: tournament.id, letter: g.letter }).select().single()
      const gPlayers = g.players.map(p => ({ ...p, dbId: playerMap[p.name + '_' + p.age] }))
      await supabase.from('group_players').insert(gPlayers.map(p => ({ group_id: group.id, player_id: p.dbId })))
      const matchInserts = []
      for (let i = 0; i < gPlayers.length; i++)
        for (let j = i + 1; j < gPlayers.length; j++)
          matchInserts.push({ group_id: group.id, home_player_id: gPlayers[i].dbId, away_player_id: gPlayers[j].dbId })
      await supabase.from('group_matches').insert(matchInserts)
    }
  }

  // Bracket KO
  const rounds = buildKnockoutRounds(teamCount)

  // Pour la coupe : nommer les joueurs directement dans le bracket
  if (type === 'coupe' && drawGroups) {
    const cupPlayers = drawGroups // drawGroups = tableau de joueurs pour la coupe
    rounds[0]?.matches.forEach((m, mi) => {
      m.home_name = cupPlayers[mi * 2]?.name ?? `Joueur ${mi * 2 + 1}`
      m.away_name = cupPlayers[mi * 2 + 1]?.name ?? `Joueur ${mi * 2 + 2}`
    })
  }

  const koInserts = []
  rounds.forEach(r => r.matches.forEach(m => koInserts.push({ tournament_id: tournament.id, ...m })))
  await supabase.from('ko_matches').insert(koInserts)

  return tournament.id
}

// ── SCORES ──
export async function saveGroupScore(matchId, groupId, homeId, sh, awayId, sa, wasPlayed, oldSh, oldSa, standings) {
  await supabase.from('group_matches').update({ score_home: sh, score_away: sa, played: true }).eq('id', matchId)
  for (const entry of standings) {
    await supabase.from('group_players').update({
      pts: entry.pts, j: entry.j, g: entry.g, n: entry.n,
      d: entry.d, bp: entry.bp, bc: entry.bc, diff: entry.diff
    }).eq('group_id', groupId).eq('player_id', entry.player_id)
  }
}

export async function saveKOScore(matchId, fields) {
  const { error } = await supabase.from('ko_matches').update(fields).eq('id', matchId)
  if (error) throw error
}

// ── REALTIME ──
export function subscribeToTournament(tournamentId, onUpdate) {
  return supabase.channel('t-' + tournamentId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'group_matches' }, onUpdate)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ko_matches', filter: `tournament_id=eq.${tournamentId}` }, onUpdate)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'group_players' }, onUpdate)
    .subscribe()
}

export function unsubscribe(channel) {
  if (channel) supabase.removeChannel(channel)
}
