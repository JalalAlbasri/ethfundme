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
import { faCircle, faPlus } from '@fortawesome/free-solid-svg-icons'

import store from './store'
import drizzleOptions from './drizzleOptions'

import App from './components/App'

library.add(faCircle)
library.add(faPlus)

ReactDOM.render(
  (
    <DrizzleProvider options={drizzleOptions} store={store}>
      <LoadingContainer>
        <App />
      </LoadingContainer>
    </DrizzleProvider>
  ),
  document.getElementById('root')
)
