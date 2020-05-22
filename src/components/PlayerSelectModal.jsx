import React from 'react'
import styled from 'styled-components'
import Modal from './Modal'
import players from '../players'

const Title = styled.header`
  margin-top: -1.5em;
  text-align: center;
`
const PlayerList = styled.section`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(3, 1fr);
`

export default function PlayerSelectModal({
  onClose,
  open,
  selectedPlayers = [],
  setSelectedPlayers
}) {
  function handleSelectPlayer(checked, player) {
    if (checked && !selectedPlayers.includes(player)) {
      setSelectedPlayers([...selectedPlayers, player])
    } else {
      selectedPlayers.splice(selectedPlayers.indexOf(player), 1)
      setSelectedPlayers(selectedPlayers)
    }
  }

  return (
    <Modal open={open} onClose={onClose} center>
      <Title>
        <h3>Choose Players</h3>
      </Title>

      <PlayerList>
        {Object.values(players).map((player, i) => {
          return (
            <label key={i}>
              <input
                onChange={({ target: { checked } }) => handleSelectPlayer(checked, player.default)}
                type="checkbox"
                checked={selectedPlayers.includes(player.default)}
              />
              {player?.default?.info?.name}
            </label>
          )
        })}
      </PlayerList>
    </Modal>
  )
}
