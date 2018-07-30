import React from 'react'
import ReactDOM from 'react-dom'
import { Drizzle, generateStore } from 'drizzle'
import { DrizzleProvider } from 'drizzle-react'
import { LoadingContainer } from 'drizzle-react-components'

import './index.css'
import AppContainer from './App'

import store from './store'
import drizzleOptions from './drizzleOptions'

ReactDOM.render(
  (
    <DrizzleProvider options={drizzleOptions}>
    {/* <DrizzleProvider options={drizzleOptions} store={store}> */}
      <LoadingContainer>
        <AppContainer />
      </LoadingContainer>
    </DrizzleProvider>
  ),
  document.getElementById('root')
)
