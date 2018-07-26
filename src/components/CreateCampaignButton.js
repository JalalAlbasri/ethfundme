import React from 'react'
// TODO: Use Prop Types

const CreateCampaignButton = ({ onCreateCampaignClick }) => {
  return (
      <button onClick={(event) => onCreateCampaignClick(event)}>CreateCampaign</button>
  )
}

export default CreateCampaignButton
