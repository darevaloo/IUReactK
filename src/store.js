import { createStore } from 'redux';

const reducer = (state,action) => {
  if (action.type === "CONTENT_PAGE") {
    return {
    ...state,
    path : action.path,
    component : action.component
    };
  }
  return state;
}
export default createStore(reducer, {path: "/", component: null});
