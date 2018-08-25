import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function EmergencyStopWarning(props) {
  if (props.isStopped) {
    return (
      <div className="alert alert-danger">
        This Campaign has been stopped by an Administrator. If you have contributed funds you will
        ba able to withdraw them below. You will not be able to contribute funds until the Campaign
        has been resumed by an admin
      </div>
    )
  }
  return null
}

export default EmergencyStopWarning
