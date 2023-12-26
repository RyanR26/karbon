import { isDefined, isArray } from '../utils/utils';

export const globalActions = (actions, runTime) => {

  const globalActions = {};

  const injectActions = actionsObj => {
    const actionsKeys = Object.keys(actionsObj);
    const actionsName = actionsKeys[0];
    globalActions[actionsName] = actionsObj[actionsName]({ stamp: runTime.stamp, msgs: runTime.messages });
  };

  if (isDefined(actions)) {
    if (isArray(actions)) {
      for (let i = 0; i < actions.length; i++) {
        injectActions(actions[i]);
      }
    } else {
      injectActions(actions);
    }
    return globalActions;
  }
}