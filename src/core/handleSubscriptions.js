import { subscription } from './subscription';
import { isDefined, isUndefined, isNullorUndef, isFunction, isString, isArray } from '../utils/utils';

export const handleSubssciptions = (subs, appId, isLocalSubs=false, appTap) => {

  /* START.DEV_ONLY */
  const subsStatus = [];
  /* END.DEV_ONLY */

  for (let i = 0; i < subs.length; i++) {

    const sub = subs[i];
    const action = isArray(sub.action) ? sub.action[0] : sub.action;

    if (isUndefined(action.name)) {
      Object.defineProperty(action.prototype, 'name', {
        get: function () {
          return /function ([^(]*)/.exec(this + '')[1];
        }
      });
    }

    const subId = sub.id || action.name + '_' + sub.name.toString().replace(/\s/g, '');
    sub.id = subId;
    sub.typeLocal = isLocalSubs;
  
    /* START.DEV_ONLY */
    if (isNullorUndef(subId)) {
      console.warn('Please add an explicit id ({id: "identifierName"}) to subscription obj due to action.name not being supported by this browser');
    }
    /* END.DEV_ONLY */

    // function denoted user or custom sub
    if (isFunction(sub.name)) {

      sub.name({
        opts: sub.options,
        action: action,
        actionArgs: isArray(sub.action) ? sub.action.slice(1) : [],
        condition: isNullorUndef(sub.when) ? true : sub.when,
        subId: subId,
        subCache: subscription.getCache()
      });

      /* START.DEV_ONLY */
      if (isDefined(appTap[appId].subscriptions)) {
        subsStatus.push({ name: sub.name.name, active: isNullorUndef(sub.when) ? true : sub.when, action: action.name });
      }
      /* END.DEV_ONLY */

      // string denotes event sub
    } else if (isString(sub.name)) {

      if (sub.when || isUndefined(sub.when)) {
        if (isDefined(sub.name)) {
          if (!isDefined(subscription.getCache()[subId])) {

            subscription.add(
              sub.el || window,
              sub.name,
              subId,
              action,
              isArray(sub.action) ? sub.action.slice(1) : undefined,
              sub.typeLocal
            );
          }
        }
        else {
          // this subscription action is called whenever the state changes
          if (isArray(sub.action)) {
            sub.action[0](...sub.action.slice(1));
          } else {
            sub.action();
          }
        }

        /* START.DEV_ONLY */
        if (isDefined(appTap[appId].subscriptions)) {
          subsStatus.push({ name: sub.name, active: true, action: action.name });
        }
        /* END.DEV_ONLY */

      } else if (!sub.when) {
        if (isDefined(sub.name)) {
          if (isDefined(subscription.getCache()[subId])) {
            subscription.remove(
              sub.el || window,
              sub.name,
              subId
            );
          }
        }

        /* START.DEV_ONLY */
        if (isDefined(appTap[appId].subscriptions)) {
          subsStatus.push({ name: sub.name, active: false, action: action.name });
        }
        /* END.DEV_ONLY */
      }
    }
  }

  const activeSubId = subs.map(sub => sub.id);
  const subCache = subscription.getCache();

  Object.keys(subCache).forEach(subId => {
    if (subCache[subId].typeLocal) {
      if (activeSubId.indexOf(subId) === -1) {
        const sub = subCache[subId];
        subscription.remove(
          sub.el || window,
          sub.eventName,
          subId
        );
      }
    }
  });

  /* START.DEV_ONLY */
  if (isDefined(appTap[appId].subscriptions)) {
    appTap[appId].subscriptions({ subs: subsStatus });
  }
  /* END.DEV_ONLY */
}