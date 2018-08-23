import React from 'react'
import ReactDOM from 'react-dom'
import { Drizzle, generateStore } from 'drizzle'
import { DrizzleProvider } from 'drizzle-react'
import { LoadingContainer } from 'drizzle-react-components'

import './index.css'
import './styles/styles.less'

import 'bootstrap/dist/css/bootstrap.min.css'

import $ from 'jquery'
import Popper from 'popper.js'
import 'bootstrap/dist/js/bootstrap.bundle.min'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCircle,
  faPlus,
  faGift,
  faForward,
  faArrowCircleDown,
  faTimesCircle,
  faCheckCircle,
  faStop,
  faPlay,
  faExclamationTriangle,
  faWrench,
  faCheck,
  faBan,
  faStopCircle,
  faPlayCircle
} from '@fortawesome/free-solid-svg-icons'

import store from './store'
import drizzleOptions from './drizzleOptions'

import App from './components/App'

library.add(faCircle)
library.add(faPlus)
library.add(faGift)
library.add(faForward)
library.add(faArrowCircleDown)
library.add(faTimesCircle)
library.add(faCheckCircle)
library.add(faStop)
library.add(faPlay)
library.add(faExclamationTriangle)
library.add(faWrench)
library.add(faCheck)
library.add(faBan)
library.add(faStopCircle)
library.add(faPlayCircle)

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

ReactDOM.render(
  <DrizzleProvider options={drizzleOptions} store={store}>
    <LoadingContainer>
      <App />
    </LoadingContainer>
  </DrizzleProvider>,
  document.getElementById('root')
)
