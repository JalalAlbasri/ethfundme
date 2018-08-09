// TODO: Rename to just Progress
import React from 'react'

function GoalProgress(props) {
  if (props.funds <= props.goal) {
    const progress = props.funds / props.goal * 100

    const progressBarStyle = {
      width: progress + '%'
    }

    return (
      <div className="progress">
        <div className="progress-bar goal"
        // <div className="progress-bar progress-bar-striped"
          role="progressbar"
          aria-valuemin="0"
          aria-valuenow={progress}
          aria-valuemax="100"
          style={progressBarStyle}
        >
          {(props.funds > 0) ? props.funds : ''}
        </div>
      </div>
    )
  }

  const goalProgress = (props.goal / props.funds) * 100
  const surplusProgress = ((props.funds - props.goal) / props.funds) * 100

  const goalProgressBarStyle = {
    width: goalProgress + '%'
  }

  const surplusProgressBarStyle = {
    width: surplusProgress + '%'
  }

  return (
      <div className="GoalProgress progress">
        <div className="progress-bar goal"
        // <div className="progress-bar progress-bar-striped"
          role="progressbar"
          aria-valuemin="0"
          aria-valuenow={goalProgress}
          aria-valuemax="100"
          style={goalProgressBarStyle}
        >
          {props.goal}
        </div>
        <div className="progress-bar surplus"
        // <div className="progress-bar progress-bar-striped bg-success"
          role="progressbar"
          aria-valuemin="0"
          aria-valuenow={surplusProgress}
          aria-valuemax="100"
          style={surplusProgressBarStyle}
        >
          {props.funds - props.goal}
        </div>
      </div>
  )
}

export default GoalProgress
