import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { createBrowserHistory } from 'history'

import { Drizzle, generateStore } from 'drizzle'
import { DrizzleProvider } from 'drizzle-react'
import { LoadingContainer } from 'drizzle-react-components'

import './index.css'
import AppContainer from './App'

import store from './store'
import drizzleOptions from './drizzleOptions'

const history = syncHistoryWithStore(createBrowserHistory(), store)

ReactDOM.render(
  (
    <DrizzleProvider options={drizzleOptions} store={store}>
      <LoadingContainer>
        <AppContainer />
        {/* <Router history={history}> */}
          {/* <Route path="/" component={AppContainer}> */}
            {/* <IndexRoute component={HomeContainer} /> */}
          {/* </Route> */}
        {/* </Router> */}
      </LoadingContainer>
    </DrizzleProvider>
  ),
  document.getElementById('root')
)
