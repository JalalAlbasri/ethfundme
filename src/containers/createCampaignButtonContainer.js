// import { connect } from 'react-redux'
import { drizzleConnect } from 'drizzle-react'
import CreateCampaignButton from '../components/CreateCampaignButton'
import { createCampaign } from '../actions/CreateCampaignButtonAction'

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onCreateCampaignClick: (event) => {
      event.preventDefault()
      dispatch(createCampaign())
    }
  }
}

// const CreateCampaignButtonContainer = connect(
const CreateCampaignButtonContainer = drizzleConnect(
  CreateCampaignButton,
  mapStateToProps,
  mapDispatchToProps
)

export default CreateCampaignButtonContainer
