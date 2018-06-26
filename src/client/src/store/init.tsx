import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

export default compose(applyMiddleware(thunk))(createStore)(reducers);