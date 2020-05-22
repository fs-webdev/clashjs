import React from 'react'
import _ from 'lodash'

class Stats extends React.Component {
  render() {
    let { stats, rounds, total } = this.props
    stats = _.map(stats, playerStats => playerStats)
    stats = _.sortBy(stats, playerStats => playerStats.ammo * -1)
    stats = _.sortBy(stats, playerStats => playerStats.kills * -1)
    stats = _.sortBy(stats, playerStats => playerStats.wins * -1)
    return (
      <div className="stats">
        <table>
          <thead>
            <tr>
              <th />
              <th>
                Round {rounds}/{total}
              </th>
              <th>Wins</th>
              <th>Rate</th>
              <th>K/D/R</th>
              <th>Ammo</th>
            </tr>
          </thead>
          <tbody>
            {_.map(stats, (playerStats, index) => {
              return (
                <tr key={index} className={playerStats.isAlive ? '' : 'player-dead'}>
                  <td className="player-dead-emoji">
                    <span aria-label="Skull" role="img">
                      💀
                    </span>
                  </td>
                  <td className="player-name">
                    {playerStats.name} {playerStats.team ? `[${playerStats.team}]` : ''}
                  </td>
                  <td className="stats-results">{playerStats.wins}</td>
                  <td className="stats-results">{playerStats.winrate}%</td>
                  <td className="stats-results">
                    {playerStats.kills}/{playerStats.deaths}/{playerStats.kdr.toFixed(1)}
                  </td>
                  <td className="stats-results">{playerStats.ammo}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

export default Stats
