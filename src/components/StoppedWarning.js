import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function StoppedWarning(props) {
  
  if (props.isStopped){
    return (
      <div className="StoppedWarning">
        <FontAwesomeIcon className="button-icon" icon="times-circle" />
        This Campaign has been stopped by an Admin.
        If you have contributed funds you will ba able to withdraw them below.
        You will not be able to contribute funds until the Campaign has been resumed by an admin
      </div>
    )
  }
  return null
}

export default StoppedWarning