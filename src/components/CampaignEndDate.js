import React from 'react'
import Moment from 'react-moment'

function CampaignEndDate(props) {
  if (props.endDate > 0) {
    const endDate = new Date(props.endDate * 1000)

    return (
        <span className="CampaignEndDate" data-toggle="tool-tip" data-placement="bottom" title={endDate.toString()}>
            ends <Moment fromNow date={endDate.getTime()} />
        </span>
    )
  }
  return null
}

export default CampaignEndDate
