import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { createCampaign } from '../actions/CampaignActions'

class CreateCampaignModal extends Component {
  constructor(props, context) {
    super(props)
    this.state = {
      title: '',
      image: '',
      description: '',
      goal: '',
      duration: ''
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleSubmit(event) {
    this.props.dispatchCreateCampaign(
      this.state.title,
      this.state.goal ? this.state.goal : 1,
      this.state.duration ? this.state.duration : 1,
      this.state.description,
      this.state.image
    )
    event.preventDefault()
  }

  handleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  render() {
    return (
      <div
        className="modal"
        tabIndex="-1"
        role="dialog"
        id="createCampaignModal"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create Campaign</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-row">
                  <img className="rounded mx-auto d-block mb-3" src={this.state.image} />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    id="title"
                    value={this.state.title}
                    onChange={this.handleInputChange}
                    placeholder="Title"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="url"
                    className="form-control"
                    name="image"
                    id="image"
                    value={this.state.image}
                    onChange={this.handleInputChange}
                    placeholder="Image URL"
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    name="description"
                    id="description"
                    value={this.state.description}
                    onChange={this.handleInputChange}
                    placeholder="Description"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      name="goal"
                      id="goal"
                      value={this.state.goal}
                      onChange={this.handleInputChange}
                      placeholder="Goal"
                      required
                    />
                  </div>
                  <div className="form-group col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      name="duration"
                      id="duration"
                      value={this.state.duration}
                      onChange={this.handleInputChange}
                      placeholder="Duration (days)"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="submit"
                className="btn btn-outline-success"
                data-dismiss="modal"
                onClick={this.handleSubmit}
              >
                <FontAwesomeIcon className="button-icon" icon="plus" />
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

CreateCampaignModal.contextTypes = {
  drizzle: PropTypes.object
}

CreateCampaignModal.propTypes = {}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchCreateCampaign: (title, goal, duration, description, image) => {
      dispatch(createCampaign(title, goal, duration, description, image))
    }
  }
}

export default drizzleConnect(CreateCampaignModal, mapStateToProps, mapDispatchToProps)
