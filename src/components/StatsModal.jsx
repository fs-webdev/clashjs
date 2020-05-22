import React from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrophy } from '@fortawesome/free-solid-svg-icons'

import Modal from './Modal'

const Title = styled.header`
  text-align: center;
  margin-top: -1.5em;
`

const Winner = styled.span`
  padding: 0 2em;
  font-size: 2em;
`

export default function StatsModal({
  open,
  onClose,
  // rounds,
  total,
  // playerStates,
  stats,
  gameState
}) {
  stats = _.map(stats, playerStats => playerStats)
  stats = _.sortBy(stats, playerStats => playerStats.ammo * -1)
  stats = _.sortBy(stats, playerStats => playerStats.kills * -1)
  stats = _.sortBy(stats, playerStats => playerStats.wins * -1)
  const duration = ((gameState.endTime || Date.now()) - gameState.startTime) / 1000
  return (
    <Modal open={open} onClose={onClose} center>
      <Title>
        <h3>Stats</h3>
      </Title>
      <div className="stats-modal">
        Duration: {duration.toFixed(1)}s
        {gameState.finished && (
          <Winner>
            <FontAwesomeIcon icon={faTrophy} color="#d4af37" />
            &nbsp;The winner is {stats[0].name}
          </Winner>
        )}
        <table>
          <thead>
            <tr>
              <th>{total} Rounds</th>
              <th>Wins</th>
              <th>Rate</th>
              <th>Kills</th>
              <th>Deaths</th>
              <th>K/D Ratio</th>
              <th>Ammo</th>
              <th>Turns</th>
              <th>Moves</th>
              <th>Shots</th>
              <th>Directions</th>
              <th>Waits</th>
              <th>Calc Time</th>
              <th>Streak</th>
            </tr>
          </thead>
          <tbody>
            {_.map(stats, (playerStats, index) => {
              // console.log('playerStats', playerStats)
              return (
                <tr key={playerStats.name}>
                  <td className="player-name">
                    {playerStats.name} {playerStats.team ? `[${playerStats.team}]` : ''}
                  </td>
                  <td className="stats-results">{playerStats.wins}</td>
                  <td className="stats-results">{playerStats.winrate}%</td>
                  <td className="stats-results">{playerStats.kills}</td>
                  <td className="stats-results">{playerStats.deaths}</td>
                  <td className="stats-results">{playerStats.kdr.toFixed(1)}</td>
                  <td className="stats-results">{playerStats.ammo}</td>
                  <td className="stats-results">{playerStats.turns}</td>
                  <td className="stats-results">{playerStats.actions.move}</td>
                  <td className="stats-results">{playerStats.actions.shoot}</td>
                  <td className="stats-results">{playerStats.actions.turn}</td>
                  <td className="stats-results">{playerStats.actions.wait}</td>
                  <td className="stats-results">{Number(playerStats.calcTime).toFixed(2)}</td>
                  <td className="stats-results">{playerStats.killStreak}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}
